import { initializeApp, getApps } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  onDisconnect
} from 'firebase/database';

const STORAGE_FB_CONFIG_KEY = 'mochi_firebase_config_v1';
const LOCAL_ROOMS_PREFIX = 'mochi_local_room_';

let firebaseApp = null;
let rtdb = null;
let activeMode = 'unconfigured'; // 'firebase' | 'local' | 'unconfigured'

const localChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('mochi_coop_local_channel')
    : null;

const localSubscribers = new Map();

if (localChannel) {
  localChannel.onmessage = (event) => {
    const { roomId, data } = event.data || {};
    if (roomId && localSubscribers.has(roomId)) {
      localSubscribers.get(roomId).forEach((cb) => cb(data));
    }
  };
}

// Cấu hình Firebase mặc định của dự án petgame-ee3e9
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDiVowc1HIkK1krv4wWSwsUb2-QaVNJAvY',
  authDomain: 'petgame-ee3e9.firebaseapp.com',
  databaseURL: 'https://petgame-ee3e9-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'petgame-ee3e9',
  storageBucket: 'petgame-ee3e9.firebasestorage.app',
  messagingSenderId: '307758124213',
  appId: '1:307758124213:web:06db0997e2187b553182fc'
};

// Đọc config từ .env, localStorage hoặc cấu hình mặc định petgame-ee3e9
export function getResolvedFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };

  if (envConfig.apiKey && envConfig.databaseURL) {
    return { config: envConfig, source: 'env' };
  }

  try {
    const raw = localStorage.getItem(STORAGE_FB_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.databaseURL) {
        return { config: parsed, source: 'localStorage' };
      }
    }
  } catch {
    // ignore parse error
  }

  return { config: DEFAULT_FIREBASE_CONFIG, source: 'default' };
}

export function saveFirebaseConfigToLocal(configObj) {
  if (!configObj) {
    localStorage.removeItem(STORAGE_FB_CONFIG_KEY);
    firebaseApp = null;
    rtdb = null;
    activeMode = 'local';
    return;
  }
  localStorage.setItem(STORAGE_FB_CONFIG_KEY, JSON.stringify(configObj));
  initFirebaseClient(true);
}

export function initFirebaseClient(forceReinit = false) {
  if (rtdb && !forceReinit) {
    return { db: rtdb, mode: 'firebase' };
  }

  const { config } = getResolvedFirebaseConfig();
  if (!config || !config.databaseURL) {
    activeMode = 'local';
    return { db: null, mode: 'local' };
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0 && !forceReinit) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(config, `mochi-app-${Date.now()}`);
    }
    rtdb = getDatabase(firebaseApp);
    activeMode = 'firebase';
    return { db: rtdb, mode: 'firebase' };
  } catch (err) {
    console.warn('Không thể khởi tạo Firebase, chuyển sang chế độ Local Co-op:', err);
    activeMode = 'local';
    return { db: null, mode: 'local', error: err.message };
  }
}

export function getConnectionMode() {
  if (activeMode === 'unconfigured') {
    initFirebaseClient();
  }
  return activeMode;
}

// Helpers cho chế độ Local Storage + BroadcastChannel (khi chưa nhập Firebase Config)
function readLocalRoom(roomId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_ROOMS_PREFIX}${roomId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalRoom(roomId, roomData) {
  localStorage.setItem(`${LOCAL_ROOMS_PREFIX}${roomId}`, JSON.stringify(roomData));
  if (localSubscribers.has(roomId)) {
    localSubscribers.get(roomId).forEach((cb) => cb(roomData));
  }
  if (localChannel) {
    localChannel.postMessage({ roomId, data: roomData });
  }
}

function deepMerge(target, source) {
  const output = { ...(target || {}) };
  if (!source) return output;
  Object.keys(source).forEach((key) => {
    const val = source[key];
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof output[key] === 'object' &&
      output[key] !== null &&
      !Array.isArray(output[key])
    ) {
      output[key] = deepMerge(output[key], val);
    } else {
      output[key] = val;
    }
  });
  return output;
}

// Tạo phòng mới
export async function createRoomInDB(roomId, initialData) {
  const { db, mode } = initFirebaseClient();
  const cleanId = roomId.trim().toUpperCase();

  if (mode === 'firebase' && db) {
    const roomRef = ref(db, `rooms/${cleanId}`);
    const snap = await get(roomRef);
    if (snap.exists()) {
      throw new Error('Mã phòng này đã tồn tại, hãy thử tạo mã mới nhé!');
    }
    await set(roomRef, initialData);
    return initialData;
  }

  writeLocalRoom(cleanId, initialData);
  return initialData;
}

// Kiểm tra và tham gia phòng
export async function joinRoomInDB(roomId, playerName, preferredRole = null) {
  const { db, mode } = initFirebaseClient();
  const cleanId = roomId.trim().toUpperCase();
  const now = Date.now();

  if (mode === 'firebase' && db) {
    const roomRef = ref(db, `rooms/${cleanId}`);
    const snap = await get(roomRef);
    if (!snap.exists()) {
      throw new Error(`Không tìm thấy phòng "${cleanId}". Hãy kiểm tra lại mã phòng nha!`);
    }
    const data = snap.val();
    const p1 = data.players?.player1;
    const p2 = data.players?.player2;

    let assignedRole = null;
    if (preferredRole === 'player1' && p1) {
      assignedRole = 'player1';
    } else if (preferredRole === 'player2' && p2) {
      assignedRole = 'player2';
    } else if (p1 && p1.name?.toLowerCase() === playerName.trim().toLowerCase()) {
      assignedRole = 'player1';
    } else if (p2 && p2.name?.toLowerCase() === playerName.trim().toLowerCase()) {
      assignedRole = 'player2';
    } else if (!p2) {
      assignedRole = 'player2';
    } else {
      throw new Error('Phòng này đã đủ 2 chủ nhân mất rồi! Hãy nhập đúng tên của bạn trong phòng để vào lại nhé.');
    }

    const playerPayload = {
      name: playerName.trim() || (assignedRole === 'player1' ? 'Chủ nhỏ 1' : 'Chủ nhỏ 2'),
      joinedAt: data.players?.[assignedRole]?.joinedAt || now,
      online: true,
      lastSeen: now
    };

    const logs = Array.isArray(data.logs) ? [...data.logs] : [];
    if (!p2 && assignedRole === 'player2') {
      logs.unshift({
        id: `log_join_${now}`,
        actor: playerPayload.name,
        action: `đã dọn vào Nhà Chung cùng ${p1?.name || 'Chủ nhỏ 1'}! 🎉`,
        petComment: `Hurray! Đủ 2 chủ nhân rồi, từ nay gấp đôi pate nha!`,
        timestamp: now
      });
    }

    await update(roomRef, {
      [`players/${assignedRole}`]: playerPayload,
      logs: logs.slice(0, 20)
    });

    return { role: assignedRole, roomData: data };
  }

  // Local mode
  const localData = readLocalRoom(cleanId);
  if (!localData) {
    throw new Error(`Chưa có phòng "${cleanId}" trên thiết bị này. Hãy bấm Tạo Nhà Mới hoặc cấu hình Firebase để nối 2 máy khác nhau!`);
  }
  const p1 = localData.players?.player1;
  const p2 = localData.players?.player2;
  let assignedRole = 'player2';

  if (preferredRole === 'player1' || (p1 && p1.name?.toLowerCase() === playerName.trim().toLowerCase())) {
    assignedRole = 'player1';
  } else if (p2 && p2.name?.toLowerCase() !== playerName.trim().toLowerCase()) {
    throw new Error('Phòng đã đủ 2 người chơi!');
  }

  localData.players = localData.players || {};
  localData.players[assignedRole] = {
    name: playerName.trim() || 'Chủ nhỏ 2',
    joinedAt: localData.players?.[assignedRole]?.joinedAt || now,
    online: true,
    lastSeen: now
  };

  if (!p2 && assignedRole === 'player2') {
    localData.logs = [
      {
        id: `log_join_${now}`,
        actor: playerName.trim(),
        action: `đã dọn vào Nhà Chung cùng ${p1?.name || 'Chủ nhỏ 1'}! 🎉`,
        petComment: 'Ủa đủ hai chủ rồi nè, mau chơi tung bóng với con đi!',
        timestamp: now
      },
      ...(localData.logs || [])
    ].slice(0, 20);
  }

  writeLocalRoom(cleanId, localData);
  return { role: assignedRole, roomData: localData };
}

// Lắng nghe dữ liệu phòng realtime
export function subscribeToRoom(roomId, callback) {
  const { db, mode } = initFirebaseClient();
  const cleanId = roomId.trim().toUpperCase();

  if (mode === 'firebase' && db) {
    const roomRef = ref(db, `rooms/${cleanId}`);
    const unsub = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val());
        } else {
          callback(null);
        }
      },
      (error) => {
        console.warn('Lỗi lắng nghe Firebase room:', error);
      }
    );
    return unsub;
  }

  // Local mode
  if (!localSubscribers.has(cleanId)) {
    localSubscribers.set(cleanId, new Set());
  }
  const setForRoom = localSubscribers.get(cleanId);
  setForRoom.add(callback);

  const initial = readLocalRoom(cleanId);
  if (initial) {
    setTimeout(() => callback(initial), 0);
  }

  const onStorage = (e) => {
    if (e.key === `${LOCAL_ROOMS_PREFIX}${cleanId}` && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    setForRoom.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

// Cập nhật từng phần dữ liệu phòng (Partial Update)
export async function updateRoomFields(roomId, updates) {
  const { db, mode } = initFirebaseClient();
  const cleanId = roomId.trim().toUpperCase();

  if (mode === 'firebase' && db) {
    const roomRef = ref(db, `rooms/${cleanId}`);
    await update(roomRef, updates);
    return;
  }

  // Local mode: xử lý cả đường dẫn có dấu '/' như 'pet/hunger' hoặc object lồng nhau
  const current = readLocalRoom(cleanId) || {};
  const next = JSON.parse(JSON.stringify(current));

  Object.entries(updates).forEach(([pathKey, value]) => {
    if (pathKey.includes('/')) {
      const parts = pathKey.split('/');
      let cursor = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!cursor[part] || typeof cursor[part] !== 'object') {
          cursor[part] = {};
        }
        cursor = cursor[part];
      }
      cursor[parts[parts.length - 1]] = value;
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof next[pathKey] === 'object' &&
      next[pathKey] !== null &&
      !Array.isArray(next[pathKey])
    ) {
      next[pathKey] = deepMerge(next[pathKey], value);
    } else {
      next[pathKey] = value;
    }
  });

  writeLocalRoom(cleanId, next);
}

// Ghi nhận Live Presence (.info/connected + onDisconnect)
export function setupLivePresence(roomId, playerRole) {
  const { db, mode } = initFirebaseClient();
  const cleanId = roomId.trim().toUpperCase();

  if (mode === 'firebase' && db && playerRole) {
    const connectedRef = ref(db, '.info/connected');
    const playerStatusRef = ref(db, `rooms/${cleanId}/players/${playerRole}`);

    const unsub = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(playerStatusRef).update({
          online: false,
          lastSeen: Date.now()
        });
        update(playerStatusRef, {
          online: true,
          lastSeen: Date.now()
        });
      }
    });

    return () => {
      unsub();
      update(playerStatusRef, {
        online: false,
        lastSeen: Date.now()
      }).catch(() => {});
    };
  }

  // Trong chế độ Local Demo: cập nhật online true và cho phép giả lập Co-op 2 người
  if (playerRole) {
    updateRoomFields(cleanId, {
      [`players/${playerRole}/online`]: true,
      [`players/${playerRole}/lastSeen`]: Date.now()
    });
  }

  return () => {};
}

// Mã hóa nhẹ XOR + Base64 để tùy chọn đồng bộ Gemini API Key trong phòng kín của 2 người
export function encodeSharedApiKey(apiKey, roomId) {
  if (!apiKey) return '';
  const salt = (roomId || 'MOCHI').toUpperCase();
  const xored = Array.from(apiKey).map((ch, idx) =>
    String.fromCharCode(ch.charCodeAt(0) ^ salt.charCodeAt(idx % salt.length))
  );
  return btoa(xored.join(''));
}

export function decodeSharedApiKey(encoded, roomId) {
  if (!encoded) return '';
  try {
    const salt = (roomId || 'MOCHI').toUpperCase();
    const raw = atob(encoded);
    return Array.from(raw)
      .map((ch, idx) =>
        String.fromCharCode(ch.charCodeAt(0) ^ salt.charCodeAt(idx % salt.length))
      )
      .join('');
  } catch {
    return '';
  }
}
