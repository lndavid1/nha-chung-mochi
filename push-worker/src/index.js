import { buildPushPayload } from '@block65/webcrypto-web-push';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Push-Secret',
  'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS
    }
  });
}

async function sendWebPush(subscription, payloadObj, env) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return { ok: false, error: 'Invalid subscription object', status: 400 };
  }

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return { ok: false, error: 'Missing VAPID keys in Worker secrets', status: 500 };
  }

  const vapid = {
    subject: env.VAPID_SUBJECT || 'mailto:mochi-pet@example.com',
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY
  };

  const message = {
    data: JSON.stringify(payloadObj),
    options: {
      ttl: 60 * 60 * 12,
      urgency: 'high'
    }
  };

  const pushPayload = await buildPushPayload(message, subscription, vapid);
  const res = await fetch(subscription.endpoint, pushPayload);

  if (res.status === 404 || res.status === 410) {
    return { ok: false, expired: true, status: res.status };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return {
      ok: false,
      expired: false,
      status: res.status,
      error: errText || `Push service HTTP ${res.status}`
    };
  }

  return { ok: true, status: res.status };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Endpoint kiểm tra sức khỏe Worker: GET /health
    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse({
        status: 'ok',
        configured: Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
        hasSecretGuard: Boolean(env.PUSH_SHARED_SECRET)
      });
    }

    // 3. Endpoint gửi thông báo đẩy: POST /send
    if (request.method === 'POST' && url.pathname === '/send') {
      if (env.PUSH_SHARED_SECRET) {
        const provided = request.headers.get('X-Push-Secret') || '';
        if (provided !== env.PUSH_SHARED_SECRET) {
          return jsonResponse({ ok: false, error: 'Unauthorized X-Push-Secret' }, 401);
        }
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
      }

      const {
        subscription,
        title = 'Nhà Chung Mochi',
        body: msgBody = 'Có tin mới từ Nhà Chung nè!',
        url: targetUrl = './',
        tag = 'mochi-general',
        badge = 1
      } = body || {};

      try {
        const result = await sendWebPush(
          subscription,
          { title, body: msgBody, url: targetUrl, tag, badge },
          env
        );
        return jsonResponse(result, result.ok || result.expired ? 200 : 502);
      } catch (err) {
        return jsonResponse(
          { ok: false, error: err?.message || 'Push encryption failed' },
          500
        );
      }
    }

    return jsonResponse({ ok: false, error: 'Not Found' }, 404);
  },

  // 4. Cron Handler (Tùy chọn): Tự động kiểm tra độ đói của thú mỗi 3 tiếng
  async scheduled(_event, env) {
    if (!env.FIREBASE_DB_URL || !env.DEFAULT_ROOM_ID) {
      return;
    }

    const baseUrl = env.FIREBASE_DB_URL.replace(/\/$/, '');
    const roomUrl = `${baseUrl}/rooms/${encodeURIComponent(env.DEFAULT_ROOM_ID)}.json`;

    try {
      const snapRes = await fetch(roomUrl);
      if (!snapRes.ok) return;
      const room = await snapRes.json();
      if (!room || !room.pet) return;

      const now = Date.now();
      const lastUpdated = Number(room.pet.lastUpdated || now);
      const elapsedHours = Math.max(0, (now - lastUpdated) / 3600000);
      const decayRate = room.pet.isSleeping ? 2.0 : 4.0;
      const currentHunger = Math.max(0, Math.round((room.pet.hunger ?? 80) - elapsedHours * decayRate));

      const lastHungryPush = Number(room.lastHungryPushAt || 0);
      const sixHoursMs = 6 * 60 * 60 * 1000;

      if (currentHunger < 25 && now - lastHungryPush >= sixHoursMs) {
        const petName = room.pet.name || 'Mochi';
        const subs = room.pushSubscriptions || {};
        const targets = [subs.player1, subs.player2].filter(Boolean);

        await Promise.all(
          targets.map((sub) =>
            sendWebPush(
              sub,
              {
                title: `🥣 ${petName} đói bụng rồi!`,
                body: `Bụng ${petName} sôi ùng ục rồi nè, có ai về cho bé ăn không?`,
                url: './',
                tag: 'mochi-hungry',
                badge: 1
              },
              env
            ).catch(() => {})
          )
        );

        // Ghi lại mốc thời gian vừa nhắc để không nhắc lại trong 6 tiếng
        await fetch(`${baseUrl}/rooms/${encodeURIComponent(env.DEFAULT_ROOM_ID)}/lastHungryPushAt.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(now)
        }).catch(() => {});
      }
    } catch {
      // ignore scheduled errors silently
    }
  }
};
