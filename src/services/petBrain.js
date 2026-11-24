// Bộ não AI cho Pet (Gemini Free Tier + Tự động đổi Model tức thì + Sticky Cooldown + Local Offline Brain)

const GEMINI_KEY_STORAGE = 'mochi_gemini_api_key_v1';
const COOLDOWN_STORAGE_KEY = 'mochi_ai_model_cooldowns_v1';
const LAST_USED_MODEL_KEY = 'mochi_ai_last_model_v1';
const LAST_CARE_AI_CALL_KEY = 'mochi_ai_last_care_ts_v1';

// Thứ tự ưu tiên các model Free Tier đúng theo đặc tả
export const AI_MODEL_CHAIN = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    tier: 'Mặc định • Siêu nhanh',
    supportsJsonMime: true,
    supportsSystemInstruction: true,
    supportsThinkingConfig: true
  },
  {
    id: 'gemini-4-hydrogen',
    name: 'Gemini 4 Hydrogen',
    tier: 'Dự phòng 1 • Thông minh',
    supportsJsonMime: true,
    supportsSystemInstruction: true,
    supportsThinkingConfig: false
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tier: 'Dự phòng 2 • Cân bằng',
    supportsJsonMime: true,
    supportsSystemInstruction: true,
    supportsThinkingConfig: false
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    tier: 'Dự phòng 3 • Hạn mức cao',
    supportsJsonMime: true,
    supportsSystemInstruction: true,
    supportsThinkingConfig: false
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tier: 'Dự phòng 4 • Ổn định',
    supportsJsonMime: true,
    supportsSystemInstruction: true,
    supportsThinkingConfig: false
  },
  {
    id: 'gemma-4-31b-it',
    name: 'Gemma 4 31B IT',
    tier: 'Dự phòng Online cuối',
    supportsJsonMime: false,
    supportsSystemInstruction: false,
    supportsThinkingConfig: false
  }
];

const VALID_EMOTIONS = ['happy', 'hungry', 'sulky', 'sleepy', 'excited', 'love'];

// 35+ câu thoại Tiếng Việt tự nhiên cho Local Offline Brain phân loại theo emotion và hành động
const LOCAL_OFFLINE_DIALOGUES = {
  happy: [
    'Meow~ Hôm nay nhà mình ấm áp quá đi, nằm lăn trên thảm thích ghê! ✨',
    'Hai chủ nhớ uống nước đầy đủ nha, đừng để con phải nhắc đó!',
    'Ơ kìa, vừa nãy có người lén nhìn ảnh trong khung tranh rồi cười tủm tỉm kìa~ 🤭',
    'Nhà sạch thơm phức, bụng lại no căng, đúng là kiếp thú cưng số hưởng!',
    'Cứ ở bên hai chủ thế này là con vui cả ngày luôn á! 💕',
    'Ai chăm con nhiều hơn là tối nay con cho ôm ngủ chung nha!'
  ],
  hungry: [
    'Ục ục... Bụng con kêu to hơn cả tiếng nhạc rồi nè, cho con măm măm đi! 🍣',
    'Hai chủ ăn ngon mà quên phần của bé hả? Mắt long lanh xin miếng cá hồi~ 🥺',
    'Đói bụng hoa cả mắt rồi, nhìn cái đệm cũng tưởng cái bánh rán luôn á!',
    'Chỉ cần một đĩa Sashimi cá hồi lúc này là mọi lỗi lầm đều được tha thứ!',
    'Ai cho ăn trước người đó là chủ cưng số 1 của con hôm nay!'
  ],
  sulky: [
    'Hứ! Bỏ bê người ta mốc meo luôn, con quay mặt vào tường dỗi 5 phút đây! 😤',
    'Đừng có mà nịnh, phải vừa cho ăn ngon vừa xoa đầu bù thì mới hết giận nha!',
    'Mây đen giăng kín đầu rồi nè... Hai chủ bận gì mà quên mất cục cưng vậy? ☁️',
    'Con ghi vào sổ thù vặt rồi nha, tí người kia onl con mách lẻo cho xem!',
    'Hờn cả thế giới! Có ai thương thân phận thú cưng cô đơn này không?'
  ],
  sleepy: [
    'Ngáp~ Mắt díp lại hết cả rồi, tắt đèn cho con đánh một giấc tới sáng nha... 💤',
    'Khò khò... Trong mơ con thấy cả nhà mình đi picnic trên đồng cỏ xanh mướt...',
    'Pin yếu báo động đỏ rồi, cho con nằm cuộn tròn trên ổ ấm xíu nha~ 🌙',
    'Đừng cù lét nữa mà, con đang mơ thấy một núi bánh kem dâu đó...',
    'Chúc hai chủ ngủ ngon mơ đẹp nha, con gác cổng nhà trong mơ cho!'
  ],
  excited: [
    'Woa!! Cả hai chủ cùng ở nhà một lúc kìa! Mau chơi tung bóng với con đi!! 🎾✨',
    'Đông đủ quá xá! Nhà có hai chủ cùng online là vui gấp trăm lần luôn!',
    'Nhảy chân sáo vòng quanh phòng! Hôm nay chắc chắn có thưởng gấp đôi xu rồi!',
    'Bắt lấy bóng nè!! Hai chủ phối hợp ăn ý quá chừng luôn á! 🥳',
    'Tim bay ngập phòng rồi kìa, đúng là ngôi nhà hạnh phúc nhất quả đất!'
  ],
  love: [
    'Gừ gừ~ Tay chủ ấm quá đi, xoa đầu thêm miếng nữa là con tan chảy luôn đó! 💖',
    'Thương hai chủ nhất trên đời! Mãi ở chung nhà với con nha!',
    'Mỗi lần hai người để lại giấy nhớ cho nhau là con đọc lén thấy ngọt xỉu luôn~ 💌',
    'Cảm ơn chủ đã chăm con chu đáo nha, tặng lại ngàn nụ hôn gió nè! 😘',
    'Combo chăm sóc đỉnh chóp! Hai người đúng là cặp bài trùng nuôi thú số một!'
  ]
};

export function getSavedGeminiKey() {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function setSavedGeminiKey(key) {
  if (!key) {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  }
}

export function getCooldownMap() {
  try {
    const raw = localStorage.getItem(COOLDOWN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCooldownMap(map) {
  localStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(map));
}

export function resetAllModelCooldowns() {
  localStorage.removeItem(COOLDOWN_STORAGE_KEY);
}

export function getLastUsedModel() {
  return localStorage.getItem(LAST_USED_MODEL_KEY) || 'local-offline-brain';
}

function setLastUsedModel(modelId) {
  localStorage.setItem(LAST_USED_MODEL_KEY, modelId);
}

/**
 * Ghi nhận Sticky Cooldown vào localStorage theo mã lỗi:
 * - 404 / 403: nghỉ 24 giờ
 * - 429: nghỉ 5 phút
 * - 5xx / timeout / mạng / JSON lỗi / 400: nghỉ 2 phút
 */
export function markModelCooldown(modelId, errorType, reasonText = '') {
  const now = Date.now();
  let durationMs = 2 * 60 * 1000; // Mặc định 2 phút

  if (errorType === 404 || errorType === 403) {
    durationMs = 24 * 60 * 60 * 1000; // 24 giờ
  } else if (errorType === 429) {
    durationMs = 5 * 60 * 1000; // 5 phút
  }

  const map = getCooldownMap();
  map[modelId] = {
    until: now + durationMs,
    errorType,
    reason: reasonText || `Mã lỗi ${errorType}`,
    updatedAt: now
  };
  saveCooldownMap(map);
}

export function isModelOnCooldown(modelId, now = Date.now()) {
  const map = getCooldownMap();
  const entry = map[modelId];
  if (!entry || !entry.until) return false;
  if (now >= entry.until) {
    return false;
  }
  return true;
}

export function getModelsStatusReport() {
  const now = Date.now();
  const map = getCooldownMap();
  const lastModel = getLastUsedModel();

  const models = AI_MODEL_CHAIN.map((m) => {
    const cd = map[m.id];
    const onCooldown = cd && cd.until > now;
    const remainingMinutes = onCooldown
      ? Math.max(1, Math.ceil((cd.until - now) / 60000))
      : 0;

    return {
      ...m,
      status: onCooldown ? 'cooldown' : 'ready',
      remainingMinutes,
      reason: onCooldown ? cd.reason : null,
      isLastUsed: lastModel === m.id
    };
  });

  return {
    models,
    lastModel,
    offlineBrainActive: lastModel === 'local-offline-brain'
  };
}

// Kiểm tra debounce 45 giây cho thao tác vuốt ve / cho ăn liên tục
export function shouldDebounceAiCall(triggerType) {
  const immediateTriggers = ['chat', 'sticky_note', 'unwrap_gift', 'welcome_back', 'coop_ball', 'test'];
  if (immediateTriggers.includes(triggerType)) {
    return false;
  }
  const now = Date.now();
  const lastTs = Number(localStorage.getItem(LAST_CARE_AI_CALL_KEY) || 0);
  if (now - lastTs < 45000) {
    return true;
  }
  localStorage.setItem(LAST_CARE_AI_CALL_KEY, String(now));
  return false;
}

// Sinh câu thoại nhanh từ Local Offline Brain
export function generateOfflinePetResponse({
  roomData,
  actorName,
  triggerType,
  userMessage,
  bothOnline
}) {
  const pet = roomData?.pet || {};
  const p1Name = roomData?.players?.player1?.name || 'Chủ 1';
  const p2Name = roomData?.players?.player2?.name || 'người kia';
  const partnerName = actorName === p1Name ? p2Name : p1Name;

  let emotion = 'happy';
  if (pet.isSleeping) {
    emotion = 'sleepy';
  } else if (
    (pet.hunger ?? 80) < 25 ||
    (pet.mood ?? 80) < 25 ||
    (pet.hygiene ?? 80) < 25
  ) {
    emotion = 'sulky';
  } else if ((pet.hunger ?? 80) < 45) {
    emotion = 'hungry';
  } else if (bothOnline || triggerType === 'coop_ball') {
    emotion = 'excited';
  } else if (triggerType === 'pet_head' || triggerType === 'feed' || triggerType === 'unwrap_gift') {
    emotion = 'love';
  }

  // Một số câu thoại ngữ cảnh đặc biệt có gắn tên 2 người chơi
  if (triggerType === 'chat' && userMessage) {
    const customReplies = [
      `Meow~ ${actorName} vừa bảo "${userMessage.slice(0, 35)}" hả? Để tí ${partnerName} vào con kể lại y nguyên nha! 🤭`,
      `Con nghe rõ rồi nha ${actorName}! Nhưng mà thưởng thêm miếng bánh kem dâu đi rồi con tâm sự tiếp~ 🍰`,
      `Hihi ${actorName} nói chuyện dễ thương ghê, thảo nào ${partnerName} mê tít! 💕`
    ];
    return {
      dialogue: customReplies[Math.floor(Math.random() * customReplies.length)],
      emotion: emotion === 'sulky' ? 'sulky' : 'happy',
      modelUsed: 'local-offline-brain'
    };
  }

  if (triggerType === 'sticky_note') {
    return {
      dialogue: `Á à, ${actorName} vừa dán giấy nhớ mới lên tường kìa! Để con canh chừng cho ${partnerName} vào đọc nha 💌`,
      emotion: 'love',
      modelUsed: 'local-offline-brain'
    };
  }

  if (triggerType === 'unwrap_gift') {
    return {
      dialogue: `Woa hộp quà xịn quá! ${partnerName} tâm lý số một luôn, phòng mình sắp đẹp lung linh rồi! 🎁✨`,
      emotion: 'excited',
      modelUsed: 'local-offline-brain'
    };
  }

  const pool = LOCAL_OFFLINE_DIALOGUES[emotion] || LOCAL_OFFLINE_DIALOGUES.happy;
  const dialogue = pool[Math.floor(Math.random() * pool.length)];

  return {
    dialogue,
    emotion,
    modelUsed: 'local-offline-brain'
  };
}

// Xây dựng Context Snapshot siêu gọn (< 350 token)
function buildCompactContextSnapshot({
  roomData,
  actorName,
  triggerType,
  actionDetail,
  userMessage,
  bothOnline
}) {
  const pet = roomData?.pet || {};
  const p1 = roomData?.players?.player1?.name || 'Chủ 1';
  const p2 = roomData?.players?.player2?.name || 'Chủ 2 (chưa vào)';
  const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const recentLogs = (roomData?.logs || [])
    .slice(0, 4)
    .map((l) => `${l.actor}: ${l.action}`)
    .join(' | ');
  const stickyText =
    roomData?.stickyNote?.mode === 'drawing'
      ? `[Tranh vẽ tay bởi ${roomData?.stickyNote?.author || p1}]`
      : `${roomData?.stickyNote?.text || ''} (bởi ${roomData?.stickyNote?.author || p1})`;

  return [
    `Giờ: ${nowStr}. Tên thú: ${pet.name || 'Mochi'} (${pet.type || 'cat'}).`,
    `2 chủ nhân: ${p1} & ${p2}. Cả 2 cùng online: ${bothOnline ? 'Có' : 'Không'}.`,
    `Chỉ số (0-100): Đói=${pet.hunger}, Vui=${pet.mood}, Sạch=${pet.hygiene}, Năng lượng=${pet.energy}, Đang ngủ=${pet.isSleeping ? 'Có' : 'Không'}.`,
    `Giấy nhớ trên tường: "${stickyText.slice(0, 120)}".`,
    `4 hoạt động gần nhất: ${recentLogs || 'Mới tạo phòng'}.`,
    `Ký ức thói quen: "${(roomData?.memorySummary || '').slice(0, 200)}".`,
    `Sự kiện vừa xảy ra (${triggerType}) bởi ${actorName}: ${actionDetail || userMessage || 'Tương tác với thú cưng'}.`
  ].join('\n');
}

const SYSTEM_INSTRUCTION_TEXT = `Bạn là thú cưng sống chung trong căn phòng của 2 chủ nhân. Tính cách: lanh lợi, đáng yêu, hơi cà khịa nhẹ, thích "mách lẻo" chuyện người này với người kia.
Hãy trả lời bằng tiếng Việt tự nhiên, ngắn gọn TỐI ĐA 2 CÂU (dưới 38 từ), xưng "con" hoặc tên thú cưng, gọi 2 người chơi bằng tên của họ.
BẮT BUỘC chỉ trả về đúng 1 JSON hợp lệ theo mẫu:
{"dialogue": "câu thoại tối đa 2 câu", "emotion": "happy|hungry|sulky|sleepy|excited|love"}`;

// Parse JSON an toàn kể cả khi model bọc trong ```json ... ```
function parsePetJsonResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty AI output');
  }
  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Invalid JSON structure');
  }

  const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  if (!parsed.dialogue || typeof parsed.dialogue !== 'string') {
    throw new Error('Missing dialogue field');
  }

  const emotion = VALID_EMOTIONS.includes(parsed.emotion) ? parsed.emotion : 'happy';
  return {
    dialogue: parsed.dialogue.trim(),
    emotion
  };
}

// Gọi 1 model cụ thể với AbortController 6000ms
async function callSingleGeminiModel(modelConfig, apiKey, snapshotText, useMinimalThinking = true) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.id}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  let requestBody;

  if (!modelConfig.supportsSystemInstruction) {
    // Dành cho gemma-4-31b-it: ghép system prompt vào user content, không gửi systemInstruction hay responseMimeType
    requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_INSTRUCTION_TEXT}\n\nữ liệu ngữ cảnh hiện tại:\n${snapshotText}\n\nChỉ xuất JSON:`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 160
      }
    };
  } else {
    const generationConfig = {
      temperature: 0.85,
      maxOutputTokens: 160
    };
    if (modelConfig.supportsJsonMime) {
      generationConfig.responseMimeType = 'application/json';
    }
    if (modelConfig.supportsThinkingConfig && useMinimalThinking) {
      generationConfig.thinkingConfig = { thinkingLevel: 'minimal' };
    }

    requestBody = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION_TEXT }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: snapshotText }]
        }
      ],
      generationConfig
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    if (!response.ok) {
      // Nếu gemini-3.5-flash-lite từ chối schema thinkingConfig (HTTP 400), thử gọi lại ngay không có thinkingConfig
      if (response.status === 400 && modelConfig.supportsThinkingConfig && useMinimalThinking) {
        clearTimeout(timer);
        return await callSingleGeminiModel(modelConfig, apiKey, snapshotText, false);
      }
      const err = new Error(`HTTP ${response.status}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const textOutput =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    return parsePetJsonResponse(textOutput);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Hàm chính gọi bộ não AI của Pet với cơ chế:
 * - Tự động nhảy model ngay lập tức trong cùng 1 vòng lặp for khi gặp lỗi
 * - Sticky Cooldown vào localStorage
 * - Nếu tất cả đang cooldown, quét lại 1 lượt trước khi rơi về Local Offline Brain
 */
export async function askPetBrain({
  roomData,
  actorName,
  triggerType = 'care',
  actionDetail = '',
  userMessage = '',
  bothOnline = false,
  sharedApiKey = ''
}) {
  // Kiểm tra debounce nếu là hành động vuốt ve / cho ăn lặp lại
  if (shouldDebounceAiCall(triggerType)) {
    const localReply = generateOfflinePetResponse({
      roomData,
      actorName,
      triggerType,
      userMessage,
      bothOnline
    });
    return { ...localReply, debounced: true };
  }

  const apiKey = getSavedGeminiKey() || sharedApiKey || '';
  if (!apiKey) {
    const offline = generateOfflinePetResponse({
      roomData,
      actorName,
      triggerType,
      userMessage,
      bothOnline
    });
    setLastUsedModel('local-offline-brain');
    return offline;
  }

  const snapshotText = buildCompactContextSnapshot({
    roomData,
    actorName,
    triggerType,
    actionDetail,
    userMessage,
    bothOnline
  });

  const now = Date.now();
  const readyModels = AI_MODEL_CHAIN.filter((m) => !isModelOnCooldown(m.id, now));
  // Nếu tất cả các model đều đang trong thời gian cooldown, vẫn thử quét lại 1 lượt
  const candidateQueue = readyModels.length > 0 ? readyModels : [...AI_MODEL_CHAIN];

  for (const modelConfig of candidateQueue) {
    try {
      const result = await callSingleGeminiModel(modelConfig, apiKey, snapshotText, true);
      setLastUsedModel(modelConfig.id);
      return {
        dialogue: result.dialogue,
        emotion: result.emotion,
        modelUsed: modelConfig.id
      };
    } catch (err) {
      const status = err?.status || (err?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_OR_JSON');
      markModelCooldown(modelConfig.id, status, err?.message || 'Lỗi kết nối');
      // Tiếp tục nhảy ngay sang model kế tiếp trong vòng lặp for
    }
  }

  // Fallback cuối cùng: Local Offline Brain (không bao giờ crash hay báo lỗi kỹ thuật cho người chơi)
  setLastUsedModel('local-offline-brain');
  return generateOfflinePetResponse({
    roomData,
    actorName,
    triggerType,
    userMessage,
    bothOnline
  });
}

/**
 * Tự động cập nhật tóm tắt ký ức 2 người chơi (tối đa 1 lần / 24h)
 */
export function maybeBuildUpdatedMemorySummary(roomData, actorName, actionDetail) {
  const now = Date.now();
  const lastUpdated = roomData?.lastMemoryUpdatedAt || 0;
  // Cập nhật tối đa 1 lần mỗi 24h (86,400,000 ms)
  if (now - lastUpdated < 86400000 && roomData?.memorySummary) {
    return null;
  }

  const p1 = roomData?.players?.player1?.name || 'Chủ 1';
  const p2 = roomData?.players?.player2?.name || 'Chủ 2';
  const streak = roomData?.streak || 1;
  const hour = new Date(now).getHours();
  const timeHabit =
    hour >= 22 || hour <= 5
      ? 'hay thức khuya chăm thú'
      : hour < 11
      ? 'thường dậy sớm ghé thăm phòng'
      : 'hay ghé phòng vào buổi chiều tối';

  const summary = `${p1} và ${p2} đã giữ chuỗi chăm sóc ${streak} ngày liên tiếp và ${timeHabit}. Gần đây ${actorName} vừa ${actionDetail || 'chăm sóc thú cưng rất chu đáo'}.`;
  return {
    memorySummary: summary,
    lastMemoryUpdatedAt: now
  };
}
