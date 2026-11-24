import { updateRoomFields } from './firebase';

const PUSH_CONFIG_STORAGE_KEY = 'mochi_push_config_v1';
const LAST_NUDGE_STORAGE_KEY = 'mochi_last_nudge_ts_v1';
const NUDGE_COOLDOWN_MS = 15 * 60 * 1000; // 15 phút

// Cấu hình công khai mặc định (CHỈ chứa Worker URL & VAPID Public Key — TUYỆT ĐỐI KHÔNG chứa Private Key)
const DEFAULT_PUSH_WORKER_URL = 'https://mochi-push-worker.vmc0886165119.workers.dev';
const DEFAULT_VAPID_PUBLIC_KEY =
  'BGIq59mJAMQ0sknNr-G2wPJ1nOSQfyvg_JBLX5Ygg_mHWLmcng7Br6XRc99j6bRHaSraJArWL_15plcqMWea-vw';

/**
 * Kiểm tra môi trường hỗ trợ Web Push (đặc biệt xử lý chuẩn cho iOS 16.4+ Standalone PWA)
 */
export function getPushEnvironment() {
  if (typeof window === 'undefined') {
    return { isIOS: false, isStandalone: false, isSupported: false, permission: 'default' };
  }

  const ua = window.navigator.userAgent || '';
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  const hasApis =
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const isSupported = hasApis && (!isIOS || isStandalone);
  const permission = 'Notification' in window ? Notification.permission : 'denied';

  return { isIOS, isStandalone, isSupported, permission };
}

/**
 * Đọc cấu hình Push Worker từ .env, localStorage hoặc node công khai /rooms/{roomId}/pushConfig
 * (Chỉ đồng bộ workerUrl & vapidPublicKey lên phòng — TUYỆT ĐỐI KHÔNG lưu Private Key)
 */
export function getPushConfig(roomPushConfig = null) {
  let local = {};
  try {
    const raw = localStorage.getItem(PUSH_CONFIG_STORAGE_KEY);
    if (raw) local = JSON.parse(raw) || {};
  } catch {
    // ignore
  }

  const workerUrl = (
    local.workerUrl ||
    import.meta.env.VITE_PUSH_WORKER_URL ||
    roomPushConfig?.workerUrl ||
    DEFAULT_PUSH_WORKER_URL
  )
    .trim()
    .replace(/\/$/, '');

  const vapidPublicKey = (
    local.vapidPublicKey ||
    import.meta.env.VITE_VAPID_PUBLIC_KEY ||
    roomPushConfig?.vapidPublicKey ||
    DEFAULT_VAPID_PUBLIC_KEY
  ).trim();

  const pushSecret = (
    local.pushSecret ||
    import.meta.env.VITE_PUSH_SECRET ||
    ''
  ).trim();

  return { workerUrl, vapidPublicKey, pushSecret };
}

export function savePushConfigToLocal({ workerUrl, vapidPublicKey, pushSecret }) {
  const clean = {
    workerUrl: (workerUrl || '').trim().replace(/\/$/, ''),
    vapidPublicKey: (vapidPublicKey || '').trim(),
    pushSecret: (pushSecret || '').trim()
  };
  localStorage.setItem(PUSH_CONFIG_STORAGE_KEY, JSON.stringify(clean));
  return clean;
}

export async function syncPublicPushConfigToRoom(roomId, { workerUrl, vapidPublicKey }) {
  if (!roomId) return;
  await updateRoomFields(roomId, {
    pushConfig: {
      workerUrl: (workerUrl || '').trim().replace(/\/$/, ''),
      vapidPublicKey: (vapidPublicKey || '').trim(),
      updatedAt: Date.now()
    }
  });
}

// Chuyển đổi VAPID Public Key từ base64url sang Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function detectDeviceLabel() {
  const ua = navigator.userAgent || '';
  if (/iPhone/i.test(ua)) return 'iPhone PWA';
  if (/iPad/i.test(ua)) return 'iPad PWA';
  if (/Android/i.test(ua)) return 'Android';
  return 'Trình duyệt PC';
}

/**
 * Xóa chấm đỏ badge ngoài màn hình chính iPhone khi người dùng mở lại app
 */
export function clearAppBadgeSafe() {
  try {
    if (navigator && typeof navigator.clearAppBadge === 'function') {
      navigator.clearAppBadge().catch(() => {});
    }
  } catch {
    // ignore
  }
}

/**
 * Kiểm tra sức khỏe Cloudflare Worker (GET /health)
 */
export async function checkPushWorkerHealth(workerUrl) {
  const cleanUrl = (workerUrl || '').trim().replace(/\/$/, '');
  if (!cleanUrl) {
    throw new Error('Vui lòng nhập Worker URL trước khi kiểm tra!');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(`${cleanUrl}/health`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Worker trả về mã HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Đăng ký nhận Web Push (BẮT BUỘC gọi trực tiếp từ sự kiện bấm nút của người dùng)
 */
export async function subscribeToPush(roomId, playerKey, roomPushConfig = null) {
  const env = getPushEnvironment();
  if (!env.isSupported) {
    if (env.isIOS && !env.isStandalone) {
      throw new Error(
        'Trên iPhone, bạn cần bấm Chia sẻ -> Thêm vào MH chính, rồi mở từ icon ngoài màn hình để bật thông báo!'
      );
    }
    throw new Error('Trình duyệt hiện tại không hỗ trợ Web Push.');
  }

  const { vapidPublicKey } = getPushConfig(roomPushConfig);
  if (!vapidPublicKey) {
    throw new Error('Chưa nhập VAPID Public Key trong mục Cài đặt Worker bên dưới!');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Bạn đã từ chối quyền thông báo. Hãy bật lại trong Cài đặt thiết bị.');
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
  }

  const subJson = subscription.toJSON();
  const payload = {
    endpoint: subJson.endpoint,
    keys: subJson.keys,
    device: detectDeviceLabel(),
    updatedAt: Date.now()
  };

  await updateRoomFields(roomId, {
    [`pushSubscriptions/${playerKey}`]: payload
  });

  return payload;
}

/**
 * Hủy đăng ký Web Push trên máy hiện tại
 */
export async function unsubscribeFromPush(roomId, playerKey) {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }
    }
  } catch {
    // ignore
  }

  if (roomId && playerKey) {
    await updateRoomFields(roomId, {
      [`pushSubscriptions/${playerKey}`]: null
    });
  }
}

/**
 * Kiểm tra xem máy hiện tại đã có PushSubscription hoạt động chưa
 */
export async function getCurrentDeviceSubscription() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/**
 * Gửi thử thông báo về chính máy hiện tại để test màn hình khóa
 */
export async function sendTestPushToSelf(roomId, playerKey, roomData) {
  const { workerUrl, pushSecret } = getPushConfig(roomData?.pushConfig);
  if (!workerUrl) {
    throw new Error('Chưa cấu hình Cloudflare Worker URL!');
  }
  const mySub = roomData?.pushSubscriptions?.[playerKey];
  if (!mySub || !mySub.endpoint) {
    throw new Error('Hãy bấm "Bật thông báo màn hình khóa" trên máy này trước!');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (pushSecret) headers['X-Push-Secret'] = pushSecret;

  const res = await fetch(`${workerUrl}/send`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subscription: { endpoint: mySub.endpoint, keys: mySub.keys },
      title: `🐾 Thử nghiệm thành công!`,
      body: `${roomData?.pet?.name || 'Mochi'} đã kết nối thông báo màn hình khóa trên máy của bạn!`,
      url: './',
      tag: 'mochi-test',
      badge: 1
    })
  });

  const data = await res.json().catch(() => ({}));
  if (data.expired) {
    await updateRoomFields(roomId, { [`pushSubscriptions/${playerKey}`]: null });
    throw new Error('Token thông báo đã hết hạn, vui lòng bấm Bật lại thông báo!');
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Không gửi được thông báo (HTTP ${res.status})`);
  }
  return data;
}

/**
 * Gửi thông báo đẩy cho người kia (Fire-and-forget an toàn, không bao giờ làm chậm hay lỗi game)
 */
export async function notifyPartner(
  roomData,
  roomId,
  currentPlayerKey,
  { title, body, tag = 'mochi-event', force = false }
) {
  try {
    if (!roomData || !roomId || !currentPlayerKey) return { skipped: true };

    const partnerKey = currentPlayerKey === 'player1' ? 'player2' : 'player1';
    const isPartnerOnline = Boolean(roomData?.players?.[partnerKey]?.online);

    // Nếu người kia đang Online nhìn màn hình và không ép buộc -> bỏ qua để tránh làm phiền
    if (!force && isPartnerOnline) {
      return { skipped: true, reason: 'partner-online' };
    }

    const partnerSub = roomData?.pushSubscriptions?.[partnerKey];
    if (!partnerSub || !partnerSub.endpoint || !partnerSub.keys) {
      return { skipped: true, reason: 'no-subscription' };
    }

    const { workerUrl, pushSecret } = getPushConfig(roomData?.pushConfig);
    if (!workerUrl) {
      return { skipped: true, reason: 'no-worker-url' };
    }

    const headers = { 'Content-Type': 'application/json' };
    if (pushSecret) headers['X-Push-Secret'] = pushSecret;

    const res = await fetch(`${workerUrl}/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subscription: {
          endpoint: partnerSub.endpoint,
          keys: partnerSub.keys
        },
        title,
        body,
        url: './',
        tag,
        badge: 1
      })
    });

    const data = await res.json().catch(() => ({}));
    if (data.expired) {
      // Tự động dọn token hỏng trên Firebase
      await updateRoomFields(roomId, {
        [`pushSubscriptions/${partnerKey}`]: null
      }).catch(() => {});
    }
    return data;
  } catch {
    return { ok: false, silent: true };
  }
}

// Quản lý Cooldown 15 phút cho nút "Gọi về nhà" (Nudge Partner)
export function getNudgeCooldownRemainingMin() {
  const lastTs = Number(localStorage.getItem(LAST_NUDGE_STORAGE_KEY) || 0);
  const diff = Date.now() - lastTs;
  if (diff >= NUDGE_COOLDOWN_MS) return 0;
  return Math.max(1, Math.ceil((NUDGE_COOLDOWN_MS - diff) / 60000));
}

export function markNudgeSentNow() {
  localStorage.setItem(LAST_NUDGE_STORAGE_KEY, String(Date.now()));
}
