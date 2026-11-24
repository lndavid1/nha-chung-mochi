import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Coins,
  Settings,
  Utensils,
  Sparkles,
  MessageCircleHeart,
  Palette,
  BookOpen,
  Heart,
  Smile,
  Bath,
  Moon,
  Sun,
  Share,
  X,
  Eye,
  EyeOff,
  Gamepad2
} from 'lucide-react';
import Onboarding from './components/Onboarding';
import RoomStage from './components/RoomStage';
import DecoratorDrawer from './components/DecoratorDrawer';
import StickyNoteModal from './components/Modals/StickyNoteModal';
import PhotoFrameModal from './components/Modals/PhotoFrameModal';
import GiftUnwrapModal from './components/Modals/GiftUnwrapModal';
import ChatModal from './components/Modals/ChatModal';
import LogModal from './components/Modals/LogModal';
import SettingsModal from './components/Modals/SettingsModal';
import ArcadeModal, { ARCADE_DAILY_CAP } from './components/Modals/ArcadeModal';
import SubwayRunGame from './components/minigames/SubwayRunGame';
import { FoodSvgIcon } from './components/furniture/FoodSvgIcons';

import {
  FOOD_CATALOG,
  computeDecayedState,
  clampStat,
  evaluateCoopCareBonus,
  normalizeEquippedRoom,
  normalizeInventoryList
} from './utils/gameLogic';
import {
  subscribeToRoom,
  updateRoomFields,
  setupLivePresence,
  decodeSharedApiKey
} from './services/firebase';
import {
  askPetBrain,
  maybeBuildUpdatedMemorySummary
} from './services/petBrain';

const SESSION_STORAGE_KEY = 'mochi_active_session_v1';
const IOS_BANNER_DISMISSED_KEY = 'mochi_ios_pwa_banner_dismissed_v1';
const LAST_READ_STICKY_KEY = 'mochi_last_read_sticky_ts_v1';

// Bộ đếm Xu nhảy số mượt mà (Animated Tabular Counter)
function AnimatedCoinCounter({ value = 120 }) {
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    const start = displayVal;
    const end = Number(value) || 0;
    if (start === end) return;

    const diff = end - start;
    const steps = 12;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setDisplayVal(end);
        clearInterval(timer);
      } else {
        setDisplayVal(Math.round(start + (diff * currentStep) / steps));
      }
    }, 24);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="tabular-nums">{displayVal}</span>;
}

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [roomData, setRoomData] = useState(null);
  const [activeTray, setActiveTray] = useState(null); // 'feed' | 'care' | null
  const [activeModal, setActiveModal] = useState(null); // 'sticky' | 'photo' | 'gift' | 'chat' | 'log' | 'settings' | 'arcade'
  const [activeMiniGame, setActiveMiniGame] = useState(null); // 'subwayRun' | null
  const [isDecoratorMode, setIsDecoratorMode] = useState(false);
  const [activeDecoratorSlot, setActiveDecoratorSlot] = useState('wall');
  const [previewEquipped, setPreviewEquipped] = useState(null);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [timeOverride, setTimeOverride] = useState('auto');
  const [comboToast, setComboToast] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [lastReadStickyTs, setLastReadStickyTs] = useState(() =>
    Number(localStorage.getItem(LAST_READ_STICKY_KEY) || 0)
  );

  const welcomeBackCheckedRef = useRef(false);

  // Phát hiện Safari iOS chưa chạy ở chế độ standalone
  useEffect(() => {
    const dismissed = localStorage.getItem(IOS_BANNER_DISMISSED_KEY);
    if (dismissed) return;

    const ua = window.navigator.userAgent || '';
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isIOS && !isStandalone) {
      setShowIosBanner(true);
    }
  }, []);

  const dismissIosBanner = () => {
    setShowIosBanner(false);
    localStorage.setItem(IOS_BANNER_DISMISSED_KEY, '1');
  };

  const handleEnterRoom = (newSession) => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    welcomeBackCheckedRef.current = false;
    setSession(newSession);
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setRoomData(null);
    setActiveModal(null);
    setIsDecoratorMode(false);
  };

  // Lắng nghe dữ liệu phòng & thiết lập Live Presence
  useEffect(() => {
    if (!session?.roomId) return;

    const unsubRoom = subscribeToRoom(session.roomId, (data) => {
      if (!data) return;
      const decayedPet = computeDecayedState(data.pet, Date.now());
      setRoomData({
        ...data,
        pet: decayedPet || data.pet
      });
    });

    const cleanupPresence = setupLivePresence(session.roomId, session.playerRole);

    return () => {
      if (unsubRoom) unsubRoom();
      if (cleanupPresence) cleanupPresence();
    };
  }, [session?.roomId, session?.playerRole]);

  const partnerRole = session?.playerRole === 'player1' ? 'player2' : 'player1';
  const partnerInfo = roomData?.players?.[partnerRole] || null;
  const isPartnerOnline = Boolean(partnerInfo?.online);
  const bothOnline = Boolean(session && isPartnerOnline);

  const hasUnreadSticky = Boolean(
    roomData?.stickyNote?.updatedAt &&
      roomData.stickyNote.updatedAt > lastReadStickyTs &&
      roomData.stickyNote.author !== session?.playerName
  );

  const showToast = (text) => {
    setComboToast(text);
    setTimeout(() => setComboToast(null), 3200);
  };

  // Gọi AI Pet Brain và đồng bộ bong bóng thoại lên Firebase
  const triggerPetAiReaction = useCallback(
    async ({
      snapshotRoom,
      triggerType,
      actionDetail,
      userMessage = '',
      logEntry = null
    }) => {
      if (!session?.roomId || !snapshotRoom) return;
      const sharedKey = snapshotRoom.encryptedGeminiKey
        ? decodeSharedApiKey(snapshotRoom.encryptedGeminiKey, session.roomId)
        : '';

      setIsAiThinking(true);
      try {
        const aiResult = await askPetBrain({
          roomData: snapshotRoom,
          actorName: session.playerName,
          triggerType,
          actionDetail,
          userMessage,
          bothOnline,
          sharedApiKey: sharedKey
        });

        const now = Date.now();
        const updates = {
          'pet/aiBubble': {
            dialogue: aiResult.dialogue,
            emotion: aiResult.emotion,
            modelUsed: aiResult.modelUsed,
            updatedAt: now
          },
          'pet/emotion': aiResult.emotion
        };

        if (logEntry) {
          const currentLogs = Array.isArray(snapshotRoom.logs)
            ? [...snapshotRoom.logs]
            : [];
          const enrichedLog = {
            ...logEntry,
            petComment: aiResult.dialogue
          };
          updates.logs = [enrichedLog, ...currentLogs].slice(0, 20);
        }

        const memUpdate = maybeBuildUpdatedMemorySummary(
          snapshotRoom,
          session.playerName,
          actionDetail
        );
        if (memUpdate) {
          updates.memorySummary = memUpdate.memorySummary;
          updates.lastMemoryUpdatedAt = memUpdate.lastMemoryUpdatedAt;
        }

        await updateRoomFields(session.roomId, updates);
      } finally {
        setIsAiThinking(false);
      }
    },
    [session, bothOnline]
  );

  // Tự động gọi AI chào mừng nếu quay lại app sau > 2 giờ
  useEffect(() => {
    if (!roomData || !session || welcomeBackCheckedRef.current) return;
    welcomeBackCheckedRef.current = true;

    const lastBubbleTime = roomData.pet?.aiBubble?.updatedAt || 0;
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (Date.now() - lastBubbleTime > twoHoursMs) {
      triggerPetAiReaction({
        snapshotRoom: roomData,
        triggerType: 'welcome_back',
        actionDetail: 'vừa mở cửa quay lại thăm phòng sau hơn 2 tiếng'
      });
    }
  }, [roomData, session, triggerPetAiReaction]);

  // 1. Xoa đầu thú cưng
  const handlePetTap = async () => {
    if (!roomData || !session) return;
    const now = Date.now();
    const nextMood = clampStat((roomData.pet?.mood ?? 80) + 6);

    await updateRoomFields(session.roomId, {
      'pet/mood': nextMood,
      'pet/lastUpdated': now
    });

    triggerPetAiReaction({
      snapshotRoom: {
        ...roomData,
        pet: { ...roomData.pet, mood: nextMood }
      },
      triggerType: 'pet_head',
      actionDetail: `vừa xoa đầu cưng nựng ${roomData.pet?.name || 'Mochi'}`
    });
  };

  // 2. Cho ăn
  const handleFeedPet = async (food) => {
    if (!roomData || !session) return;
    const currentCoins = roomData.coins ?? 0;
    if (currentCoins < food.price) {
      showToast('Chưa đủ Xu chung rồi! Hãy chăm thú hoặc dọn phòng để nhận thêm Xu nhé.');
      return;
    }

    const now = Date.now();
    const bonus = evaluateCoopCareBonus(roomData, session.playerRole, 10);
    const nextCoins = currentCoins - food.price + bonus.earnedCoins;

    const nextHunger = clampStat((roomData.pet?.hunger ?? 80) + food.hunger);
    const nextMood = clampStat((roomData.pet?.mood ?? 80) + food.mood);
    const nextEnergy = clampStat((roomData.pet?.energy ?? 80) + food.energy);

    const updates = {
      coins: nextCoins,
      streak: bonus.nextStreak,
      streakDate: bonus.streakDate,
      todayComboCounted: bonus.todayComboCounted,
      'pet/hunger': nextHunger,
      'pet/mood': nextMood,
      'pet/energy': nextEnergy,
      'pet/isSleeping': false,
      'pet/lastCareBy': session.playerRole,
      'pet/lastUpdated': now
    };

    await updateRoomFields(session.roomId, updates);
    setActiveTray(null);

    if (bonus.isCoopCombo) {
      showToast(`CO-OP COMBO x2 XU! (+${bonus.earnedCoins} Xu) • Streak ${bonus.nextStreak} ngày!`);
    } else {
      showToast(`Đã thưởng ${food.name} (+${bonus.earnedCoins} Xu chăm sóc)`);
    }

    const logEntry = {
      id: `log_feed_${now}`,
      actor: session.playerName,
      action: `đã cho ${roomData.pet?.name || 'Mochi'} ăn ${food.name}${
        bonus.isCoopCombo ? ' (Kích hoạt Co-op Combo x2 Xu!)' : ''
      }`,
      timestamp: now
    };

    triggerPetAiReaction({
      snapshotRoom: {
        ...roomData,
        coins: nextCoins,
        streak: bonus.nextStreak,
        pet: {
          ...roomData.pet,
          hunger: nextHunger,
          mood: nextMood,
          energy: nextEnergy,
          isSleeping: false
        }
      },
      triggerType: 'feed',
      actionDetail: `cho ăn ${food.name}`,
      logEntry
    });
  };

  // 3. Chăm sóc (Tắm rửa / Dọn phòng / Bật-tắt đèn ngủ)
  const handleCareAction = async (type) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const bonus = evaluateCoopCareBonus(roomData, session.playerRole, 8);
    let actionDesc = '';
    const updates = {
      coins: (roomData.coins ?? 0) + bonus.earnedCoins,
      streak: bonus.nextStreak,
      streakDate: bonus.streakDate,
      todayComboCounted: bonus.todayComboCounted,
      'pet/lastCareBy': session.playerRole,
      'pet/lastUpdated': now
    };

    if (type === 'bath') {
      updates['pet/hygiene'] = 100;
      updates['pet/mood'] = clampStat((roomData.pet?.mood ?? 80) + 10);
      actionDesc = `đã tắm bọt thơm phức cho ${roomData.pet?.name || 'Mochi'}`;
    } else if (type === 'clean_all') {
      const trashCount = (roomData.pet?.trashList || []).length;
      const extraTrashCoins = trashCount * 5;
      updates.coins += extraTrashCoins;
      updates['pet/trashList'] = [];
      updates['pet/hygiene'] = clampStat((roomData.pet?.hygiene ?? 80) + 15);
      actionDesc = `đã quét dọn sạch bóng căn phòng (+${bonus.earnedCoins + extraTrashCoins} Xu)`;
    } else if (type === 'toggle_sleep') {
      const nextSleep = !roomData.pet?.isSleeping;
      updates['pet/isSleeping'] = nextSleep;
      updates['pet/energy'] = clampStat(
        (roomData.pet?.energy ?? 80) + (nextSleep ? 12 : 0)
      );
      actionDesc = nextSleep
        ? `đã tắt đèn đắp chăn cho ${roomData.pet?.name || 'Mochi'} đi ngủ`
        : `đã bật đèn đánh thức ${roomData.pet?.name || 'Mochi'} dậy chơi`;
    }

    await updateRoomFields(session.roomId, updates);
    setActiveTray(null);

    if (bonus.isCoopCombo) {
      showToast(`CO-OP COMBO x2! (+${bonus.earnedCoins} Xu) • Phối hợp ăn ý quá!`);
    } else {
      showToast(`Chăm sóc hoàn tất (+${bonus.earnedCoins} Xu)`);
    }

    const logEntry = {
      id: `log_care_${now}`,
      actor: session.playerName,
      action: actionDesc,
      timestamp: now
    };

    triggerPetAiReaction({
      snapshotRoom: {
        ...roomData,
        pet: {
          ...roomData.pet,
          hygiene: updates['pet/hygiene'] ?? roomData.pet?.hygiene,
          isSleeping: updates['pet/isSleeping'] ?? roomData.pet?.isSleeping
        }
      },
      triggerType: 'care',
      actionDetail: actionDesc,
      logEntry
    });
  };

  // 4. Dọn 1 cục rác/bụi trên sàn (+5 Xu)
  const handleCleanSingleTrash = async (trashId) => {
    if (!roomData || !session) return;
    const currentList = Array.isArray(roomData.pet?.trashList)
      ? roomData.pet.trashList
      : [];
    const nextList = currentList.filter((t) => t.id !== trashId);
    const nextCoins = (roomData.coins ?? 0) + 5;
    const nextHygiene = clampStat((roomData.pet?.hygiene ?? 80) + 5);

    await updateRoomFields(session.roomId, {
      coins: nextCoins,
      'pet/trashList': nextList,
      'pet/hygiene': nextHygiene
    });
  };

  // 5. Chơi tung bóng đôi Co-op (+20 Xu)
  const handleCoopPlayBall = async () => {
    if (!roomData || !session) return;
    const now = Date.now();
    const nextCoins = (roomData.coins ?? 0) + 20;
    const nextMood = clampStat((roomData.pet?.mood ?? 80) + 20);

    await updateRoomFields(session.roomId, {
      coins: nextCoins,
      'pet/mood': nextMood,
      'pet/emotion': 'excited',
      'pet/lastUpdated': now
    });

    showToast('Cả hai cùng chơi tung bóng với bé! (+20 Xu chung)');

    const logEntry = {
      id: `log_ball_${now}`,
      actor: `${session.playerName} & ${partnerInfo?.name || 'Chủ 2'}`,
      action: `cùng online chơi tung bóng đôi với ${roomData.pet?.name || 'Mochi'} (+20 Xu)!`,
      timestamp: now
    };

    triggerPetAiReaction({
      snapshotRoom: {
        ...roomData,
        coins: nextCoins,
        pet: { ...roomData.pet, mood: nextMood, emotion: 'excited' }
      },
      triggerType: 'coop_ball',
      actionDetail: 'Cả hai chủ nhân cùng online chơi tung bóng đôi vui vẻ',
      logEntry
    });
  };

  // 6. Xem thử trực tiếp (Live Preview), Mua & Lắp đồ nội thất trong DecoratorDrawer
  const handlePreviewItem = (item) => {
    setPreviewEquipped((prev) => ({
      ...(prev || {}),
      [item.slot]: item.id
    }));
  };

  const handleBuyAndEquip = async (item) => {
    if (!roomData || !session) return;
    if ((roomData.coins ?? 0) < item.price) return;

    const now = Date.now();
    const nextCoins = (roomData.coins ?? 0) - item.price;
    const inventory = normalizeInventoryList([
      ...(roomData.room?.inventory || []),
      item.id
    ]);
    const equipped = {
      ...normalizeEquippedRoom(roomData.room?.equipped),
      [item.slot]: item.id
    };

    const logEntry = {
      id: `log_shop_${now}`,
      actor: session.playerName,
      action: `vừa sắm "${item.name}" trang hoàng phòng mới!`,
      petComment: `Oa, ${item.name} hợp với tổ ấm của mình ghê!`,
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      coins: nextCoins,
      'room/inventory': inventory,
      'room/equipped': equipped,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    });

    setPreviewEquipped(null);
    showToast(`Đã mua và lắp "${item.name}" vào phòng!`);
  };

  const handleEquipExisting = async (item) => {
    if (!roomData || !session) return;
    await updateRoomFields(session.roomId, {
      [`room/equipped/${item.slot}`]: item.id
    });
    setPreviewEquipped(null);
    showToast(`Đã lắp "${item.name}"`);
  };

  // 7. Gói làm hộp quà bất ngờ (Mystery Gift)
  const handleSendMysteryGift = async (item, message) => {
    if (!roomData || !session) return;
    if ((roomData.coins ?? 0) < item.price) return;
    const now = Date.now();
    const nextCoins = (roomData.coins ?? 0) - item.price;

    const giftPayload = {
      id: `gift_${now}`,
      itemId: item.id,
      itemName: item.name,
      slot: item.slot,
      senderRole: session.playerRole,
      senderName: session.playerName,
      message,
      createdAt: now
    };

    const logEntry = {
      id: `log_gift_${now}`,
      actor: session.playerName,
      action: `đã đặt một Hộp Quà Bất Ngờ giữa phòng cho người kia!`,
      petComment: 'Suỵt! Con biết trong hộp có gì nhưng không bật mí đâu~',
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      coins: nextCoins,
      mysteryGift: giftPayload,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    });
    showToast('Đã đặt Hộp Quà Bất Ngờ giữa phòng cho người kia bóc!');
  };

  // 8. Bóc hộp quà bất ngờ
  const handleConfirmUnwrapGift = async (gift) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const inventory = normalizeInventoryList([
      ...(roomData.room?.inventory || []),
      gift.itemId
    ]);
    const equipped = {
      ...normalizeEquippedRoom(roomData.room?.equipped),
      [gift.slot]: gift.itemId
    };

    const logEntry = {
      id: `log_unwrap_${now}`,
      actor: session.playerName,
      action: `đã bóc hộp quà "${gift.itemName}" từ ${gift.senderName}!`,
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      'room/inventory': inventory,
      'room/equipped': equipped,
      mysteryGift: null
    });

    triggerPetAiReaction({
      snapshotRoom: {
        ...roomData,
        mysteryGift: null
      },
      triggerType: 'unwrap_gift',
      actionDetail: `vừa mở hộp quà bất ngờ nhận được ${gift.itemName} từ ${gift.senderName} kèm lời nhắn "${gift.message}"`,
      logEntry
    });
  };

  // 9. Mở & Lưu Giấy nhớ bảng bần
  const handleOpenStickyModal = () => {
    const now = Date.now();
    setLastReadStickyTs(now);
    localStorage.setItem(LAST_READ_STICKY_KEY, String(now));
    setActiveModal('sticky');
  };

  const handleSaveStickyNote = async (notePayload) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const stickyNote = {
      ...notePayload,
      author: session.playerName,
      updatedAt: now
    };

    await updateRoomFields(session.roomId, { stickyNote });
    setLastReadStickyTs(now);
    localStorage.setItem(LAST_READ_STICKY_KEY, String(now));
    showToast('Đã ghim giấy nhớ mới lên bảng bần!');

    const logEntry = {
      id: `log_note_${now}`,
      actor: session.playerName,
      action:
        notePayload.mode === 'drawing'
          ? 'đã vẽ một bức tranh Doodle mới lên bảng bần!'
          : `đã ghim giấy nhớ mới: "${notePayload.text.slice(0, 40)}"`,
      timestamp: now
    };

    triggerPetAiReaction({
      snapshotRoom: { ...roomData, stickyNote },
      triggerType: 'sticky_note',
      actionDetail: `dán giấy nhớ mới: "${notePayload.text}"`,
      logEntry
    });
  };

  // 10. Lưu ảnh khung tranh Polaroid
  const handleSavePhotoFrame = async (photoPayload) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const logEntry = {
      id: `log_photo_${now}`,
      actor: session.playerName,
      action: `vừa treo ảnh Polaroid mới: "${photoPayload.caption}"`,
      petComment: 'Hai chủ chụp ảnh đẹp đôi quá chừng, cho con chụp ké với!',
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      photoFrame: photoPayload,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    });
    showToast('Đã cập nhật ảnh Polaroid trên tường!');
  };

  // 11. Chat với bộ não AI của Pet
  const handleSendChatToPet = async (userMessage) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const logEntry = {
      id: `log_chat_${now}`,
      actor: session.playerName,
      action: `tâm sự với ${roomData.pet?.name || 'Mochi'}: "${userMessage}"`,
      timestamp: now
    };

    await triggerPetAiReaction({
      snapshotRoom: roomData,
      triggerType: 'chat',
      actionDetail: `nói chuyện với thú cưng: "${userMessage}"`,
      userMessage,
      logEntry
    });
  };

  // 12. Đổi tên thú cưng & Bật/tắt giả lập Co-op 2 người online
  const handleRenamePet = async (newName) => {
    if (!roomData || !session) return;
    await updateRoomFields(session.roomId, {
      'pet/name': newName
    });
    showToast(`Đã đổi tên bé thành "${newName}"!`);
  };

  const handleSyncEncryptedKey = async (encodedKey) => {
    if (!session?.roomId) return;
    await updateRoomFields(session.roomId, {
      encryptedGeminiKey: encodedKey
    });
  };

  const handleToggleDemoCoopPartner = async () => {
    if (!roomData || !session) return;
    const nextOnline = !isPartnerOnline;
    await updateRoomFields(session.roomId, {
      [`players/${partnerRole}`]: {
        name: partnerInfo?.name || 'Người Thương',
        joinedAt: partnerInfo?.joinedAt || Date.now(),
        online: nextOnline,
        lastSeen: Date.now()
      }
    });
    showToast(
      nextOnline
        ? 'Người kia đang ở nhà cùng bạn! Đã mở khóa "Cùng chơi tung bóng"!'
        : 'Người kia đã tạm rời phòng.'
    );
  };

  // 13. Kết thúc ván mini-game "Mochi Chạy Phố" (lưu kỷ lục /minigames/subwayRun, cộng thưởng, cập nhật nhật ký & gọi petBrain)
  const todayKeyStr = new Date().toISOString().slice(0, 10);
  const dailyArcadeEarned =
    roomData?.minigames?.dailyBonusDate === todayKeyStr
      ? Number(roomData?.minigames?.dailyBonusCoins || 0)
      : 0;
  const dailyArcadeRemaining = Math.max(0, ARCADE_DAILY_CAP - dailyArcadeEarned);

  const handleSubwayRunComplete = async ({
    score,
    distance,
    collectedCoins,
    rewardCoins,
    passedPartner
  }) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const myRole = session.playerRole;
    const prevMyBest = roomData?.minigames?.subwayRun?.highScores?.[myRole] || {
      score: 0,
      distance: 0,
      coins: 0
    };

    const nextCoins = (roomData.coins ?? 0) + rewardCoins;
    const nextMood = clampStat((roomData.pet?.mood ?? 80) + 12);
    const nextEnergy = clampStat((roomData.pet?.energy ?? 80) - 6);

    const updates = {
      coins: nextCoins,
      'pet/mood': nextMood,
      'pet/energy': nextEnergy,
      'pet/isSleeping': false,
      'pet/lastUpdated': now,
      'minigames/dailyBonusDate': todayKeyStr,
      'minigames/dailyBonusCoins': dailyArcadeEarned + rewardCoins
    };

    if (score > (prevMyBest.score || 0)) {
      updates[`minigames/subwayRun/highScores/${myRole}`] = {
        score,
        distance,
        coins: collectedCoins,
        updatedAt: now
      };
    }

    const partnerDisplayName = partnerInfo?.name || 'người kia';
    const actionDesc = passedPartner
      ? `vừa phá kỷ lục Mochi Chạy Phố (${score} điểm, ${distance}m) và vượt mặt ${partnerDisplayName}!`
      : `vừa chạy phố cùng ${roomData.pet?.name || 'Mochi'} đạt ${score} điểm (+${rewardCoins} Xu)!`;

    const logEntry = {
      id: `log_subway_${now}`,
      actor: session.playerName,
      action: actionDesc,
      timestamp: now
    };

    if (!passedPartner) {
      updates.logs = [
        {
          ...logEntry,
          petComment: `Chạy gió thổi bay cả tai con rồi, nhưng nhặt được +${rewardCoins} Xu đã ghê!`
        },
        ...(roomData.logs || [])
      ].slice(0, 20);
    }

    await updateRoomFields(session.roomId, updates);

    if (passedPartner) {
      triggerPetAiReaction({
        snapshotRoom: {
          ...roomData,
          coins: nextCoins,
          pet: { ...roomData.pet, mood: nextMood, energy: nextEnergy }
        },
        triggerType: 'care',
        actionDetail: `${session.playerName} vừa chạy phố đạt ${score} điểm, vượt mặt kỷ lục của ${partnerDisplayName}! Hãy cà khịa nhẹ nhàng!`,
        logEntry
      });
    }
  };

  if (!session) {
    return <Onboarding onEnterRoom={handleEnterRoom} />;
  }

  const pet = roomData?.pet || {
    name: 'Mochi',
    type: 'cat',
    hunger: 80,
    mood: 85,
    hygiene: 90,
    energy: 85
  };

  const statItems = [
    {
      id: 'hunger',
      label: 'Đói',
      value: pet.hunger ?? 80,
      icon: Utensils,
      barColor: (pet.hunger ?? 80) < 30 ? 'bg-[#E85D75]' : 'bg-[#FF9B71]'
    },
    {
      id: 'mood',
      label: 'Vui',
      value: pet.mood ?? 85,
      icon: Smile,
      barColor: (pet.mood ?? 85) < 30 ? 'bg-[#E85D75]' : 'bg-[#FFB7C5]'
    },
    {
      id: 'hygiene',
      label: 'Sạch',
      value: pet.hygiene ?? 90,
      icon: Bath,
      barColor: (pet.hygiene ?? 90) < 30 ? 'bg-[#E85D75]' : 'bg-[#88C9A1]'
    },
    {
      id: 'energy',
      label: 'Ngủ',
      value: pet.energy ?? 85,
      icon: Moon,
      barColor: (pet.energy ?? 85) < 30 ? 'bg-[#E85D75]' : 'bg-[#FFE082]'
    }
  ];

  return (
    <div className="relative w-full max-w-[430px] mx-auto h-[100dvh] overflow-hidden select-none bg-[#FFF8F0] shadow-2xl">
      {/* 1. FULL-BLEED 2.5D ROOM CANVAS (Tràn viền 100dvh, không viền đen thô bao quanh) */}
      <div
        className={`w-full transition-all duration-300 ${
          isDecoratorMode ? 'h-[66dvh]' : 'h-[100dvh]'
        }`}
      >
        <RoomStage
          roomData={roomData}
          previewEquipped={previewEquipped}
          isDecoratorMode={isDecoratorMode}
          activeDecoratorSlot={activeDecoratorSlot}
          onSelectDecoratorSlot={(slotId) => setActiveDecoratorSlot(slotId)}
          timeOverride={timeOverride}
          bothOnline={bothOnline}
          isTrayOpen={Boolean(activeTray)}
          isPhotoMode={isPhotoMode}
          onPetTap={handlePetTap}
          onCoopPlayBall={handleCoopPlayBall}
          onCleanTrash={handleCleanSingleTrash}
          onOpenStickyNote={handleOpenStickyModal}
          onOpenPhotoFrame={() => setActiveModal('photo')}
          onOpenGift={() => setActiveModal('gift')}
          onOpenChat={() => setActiveModal('chat')}
          hasUnreadSticky={hasUnreadSticky}
        />
      </div>

      {/* 2. FLOATING TOP BAR (z-[55] — Nằm trên lớp ánh sáng z-[40], tôn trọng safe-area-inset-top) */}
      <div
        style={{
          top: 'max(env(safe-area-inset-top, 10px), 10px)'
        }}
        className="absolute inset-x-0 z-[55] px-3 pointer-events-none flex flex-col gap-1.5"
      >
        {showIosBanner && !isPhotoMode && (
          <div className="pointer-events-auto px-3 py-1.5 rounded-2xl bg-[#4A3525] text-[#FFF8F0] text-[11px] font-bold flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-1.5">
              <Share className="w-3.5 h-3.5 text-[#FFE082] shrink-0" />
              <span>
                Bấm <strong>Chia sẻ</strong> → <strong>Thêm vào MH chính</strong> để chơi toàn màn hình!
              </span>
            </div>
            <button
              type="button"
              onClick={dismissIosBanner}
              className="p-0.5 rounded-full bg-white/15"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <header className="flex items-center justify-between gap-2">
          {!isPhotoMode ? (
            <div className="pointer-events-auto cozy-glass rounded-full px-3 py-1.5 border-[2px] border-[#4A3525] flex items-center gap-2.5 shadow-sm">
              <span className="text-xs font-black text-[#4A3525] truncate max-w-[84px]">
                {pet.name || 'Mochi'}
              </span>

              <div className="h-3.5 w-[1.5px] bg-[#4A3525]/20" />

              <div
                className="flex items-center gap-0.5 text-xs font-black text-[#E85D75] tabular-nums"
                title="Chuỗi ngày Co-op Streak"
              >
                <Flame className="w-3.5 h-3.5 fill-[#FF9B71]" />
                <span>{roomData?.streak ?? 1}</span>
              </div>

              <div className="h-3.5 w-[1.5px] bg-[#4A3525]/20" />

              <div
                className="flex items-center gap-1 text-xs font-black text-[#4A3525]"
                title="Ngân quỹ Xu chung"
              >
                <Coins className="w-3.5 h-3.5 text-[#E87A4D]" />
                <AnimatedCoinCounter value={roomData?.coins ?? 120} />
              </div>
            </div>
          ) : (
            <div />
          )}

          <div className="pointer-events-auto flex items-center gap-1.5">
            {!isPhotoMode && (
              <div className="cozy-glass rounded-full px-2.5 py-1.5 border-[2px] border-[#4A3525] flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full border border-[#4A3525] ${
                    isPartnerOnline ? 'bg-[#88C9A1] animate-pulse' : 'bg-[#D6C7B8]'
                  }`}
                />
                <span className="text-[10.5px] font-black text-[#4A3525] truncate max-w-[92px]">
                  {bothOnline
                    ? 'Đang ở nhà'
                    : partnerInfo?.name
                    ? partnerInfo.name
                    : session.roomId}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setIsPhotoMode((prev) => !prev);
                setActiveTray(null);
                if (isDecoratorMode) {
                  setIsDecoratorMode(false);
                  setPreviewEquipped(null);
                }
              }}
              className="cozy-glass w-9 h-9 rounded-full border-[2px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90 transition-transform"
              title={isPhotoMode ? 'Hiện lại giao diện' : 'Ẩn HUD để ngắm phòng / chụp ảnh'}
            >
              {isPhotoMode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>

            {!isPhotoMode && (
              <button
                type="button"
                onClick={() => {
                  setActiveTray(null);
                  setActiveModal('arcade');
                }}
                className="cozy-glass w-9 h-9 rounded-full border-[2px] border-[#4A3525] bg-[#FFE082]/90 flex items-center justify-center text-[#4A3525] active:scale-90 transition-transform"
                title="Góc Vui Chơi • Mochi Chạy Phố"
              >
                <Gamepad2 className="w-4 h-4" />
              </button>
            )}

            {!isPhotoMode && (
              <button
                type="button"
                onClick={() => setActiveModal('settings')}
                className="cozy-glass w-9 h-9 rounded-full border-[2px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90 transition-transform"
                title="Cài đặt phòng & Bộ não AI"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Thông báo nổi (Co-op Combo / Thưởng Xu) */}
      <AnimatePresence>
        {comboToast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] w-[88%] max-w-xs cozy-glass-dark text-[#FFF8F0] text-xs font-extrabold px-4 py-2 rounded-2xl text-center"
          >
            {comboToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FLOATING BOTTOM HUD (z-[55] — Nằm trên lớp ánh sáng z-[40] và mọi vật thể trong phòng) */}
      {!isPhotoMode && !isDecoratorMode && (
        <div
          style={{
            bottom: 'max(env(safe-area-inset-bottom, 10px), 10px)'
          }}
          className="absolute inset-x-0 z-[55] px-3 pointer-events-none flex flex-col gap-1.5"
        >
          {/* Khay trượt nhanh: Cho Ăn hoặc Chăm Sóc */}
          <AnimatePresence>
            {activeTray === 'feed' && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                className="pointer-events-auto bg-[#FFFDF9]/98 backdrop-blur-md rounded-[24px] p-3 border-[2.2px] border-[#4A3525] shadow-2xl"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-black text-[#4A3525]">
                    Bữa ngon cho {pet.name || 'Mochi'} (Đổi phiên = x2 Xu)
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTray(null)}
                    className="px-2 py-0.5 rounded-lg bg-[#FFF0DE] border border-[#4A3525] text-[11px] font-black text-[#4A3525]"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {FOOD_CATALOG.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleFeedPet(food)}
                      className="tactile-btn p-2 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex flex-col items-center text-center"
                    >
                      <FoodSvgIcon foodId={food.id} className="w-10 h-10" />
                      <span className="text-[10.5px] font-black text-[#4A3525] mt-1 leading-tight line-clamp-1">
                        {food.name}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#E87A4D] mt-0.5 tabular-nums">
                        {food.price === 0 ? 'Miễn phí' : `${food.price} Xu`}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTray === 'care' && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                className="pointer-events-auto bg-[#FFFDF9]/98 backdrop-blur-md rounded-[24px] p-3 border-[2.2px] border-[#4A3525] shadow-2xl"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-black text-[#4A3525]">
                    Chăm sóc & Dọn dẹp Tổ Ấm
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTray(null)}
                    className="px-2 py-0.5 rounded-lg bg-[#FFF0DE] border border-[#4A3525] text-[11px] font-black text-[#4A3525]"
                  >
                    Đóng
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCareAction('bath')}
                    className="tactile-btn p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex flex-col items-center"
                  >
                    <Bath className="w-5 h-5 text-[#4A3525] mb-1" />
                    <span className="text-xs font-black text-[#4A3525]">Tắm Thơm</span>
                    <span className="text-[10px] font-bold text-[#7D6352]">Sạch 100%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCareAction('clean_all')}
                    className="tactile-btn p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex flex-col items-center"
                  >
                    <Sparkles className="w-5 h-5 text-[#5EA87A] mb-1" />
                    <span className="text-xs font-black text-[#4A3525]">Dọn Phòng</span>
                    <span className="text-[10px] font-bold text-[#7D6352]">Quét sạch bụi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCareAction('toggle_sleep')}
                    className="tactile-btn p-2.5 rounded-2xl bg-[#FFF8F0] border-[1.8px] border-[#4A3525] flex flex-col items-center"
                  >
                    {pet.isSleeping ? (
                      <Sun className="w-5 h-5 text-[#E87A4D] mb-1" />
                    ) : (
                      <Moon className="w-5 h-5 text-[#4A3525] mb-1" />
                    )}
                    <span className="text-xs font-black text-[#4A3525]">
                      {pet.isSleeping ? 'Bật Đèn Dậy' : 'Tắt Đèn Ngủ'}
                    </span>
                    <span className="text-[10px] font-bold text-[#7D6352]">
                      +15 Năng lượng/h
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* THANH 4 CHỈ SỐ TINH GỌN */}
          <div className="pointer-events-auto grid grid-cols-4 gap-1.5">
            {statItems.map((st) => {
              const IconComp = st.icon;
              const isLow = st.value < 30;
              return (
                <div
                  key={st.id}
                  className={`cozy-glass rounded-2xl px-2.5 py-1.5 border-[1.8px] transition-all ${
                    isLow
                      ? 'border-[#E85D75] bg-[#FFF0F3]/95 animate-bounce'
                      : 'border-[#4A3525]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10.5px] font-black text-[#4A3525] mb-1">
                    <span className="flex items-center gap-1">
                      <IconComp className="w-3 h-3 text-[#4A3525]" />
                      {st.label}
                    </span>
                    <span className="tabular-nums">{st.value}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#4A3525]/15 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${st.barColor}`}
                      style={{ width: `${st.value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* TACTILE BOTTOM DOCK */}
          <nav className="pointer-events-auto cozy-glass rounded-[28px] p-1.5 border-[2.4px] border-[#4A3525] grid grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={() =>
                setActiveTray(activeTray === 'feed' ? null : 'feed')
              }
              className={`tactile-btn py-2 rounded-[20px] border-[1.8px] border-[#4A3525] flex flex-col items-center justify-center gap-0.5 ${
                activeTray === 'feed'
                  ? 'bg-[#FFE082] text-[#4A3525]'
                  : 'bg-[#FFFDF9] text-[#4A3525]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span className="text-[10.5px] font-black">Cho ăn</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTray(activeTray === 'care' ? null : 'care')
              }
              className={`tactile-btn py-2 rounded-[20px] border-[1.8px] border-[#4A3525] flex flex-col items-center justify-center gap-0.5 ${
                activeTray === 'care'
                  ? 'bg-[#88C9A1] text-[#4A3525]'
                  : 'bg-[#FFFDF9] text-[#4A3525]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10.5px] font-black">Chăm sóc</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTray(null);
                setPreviewEquipped(null);
                setIsDecoratorMode(true);
              }}
              className="tactile-btn py-2 rounded-[20px] border-[1.8px] border-[#4A3525] bg-[#FF9B71] text-[#4A3525] flex flex-col items-center justify-center gap-0.5"
            >
              <Palette className="w-4 h-4" />
              <span className="text-[10.5px] font-black">Trang trí</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTray(null);
                setActiveModal('chat');
              }}
              className="tactile-btn py-2 rounded-[20px] border-[1.8px] border-[#4A3525] bg-[#FFB7C5] text-[#4A3525] flex flex-col items-center justify-center gap-0.5"
            >
              <MessageCircleHeart className="w-4 h-4" />
              <span className="text-[10.5px] font-black">Trò chuyện</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTray(null);
                setActiveModal('log');
              }}
              className="tactile-btn py-2 rounded-[20px] border-[1.8px] border-[#4A3525] bg-[#FFFDF9] text-[#4A3525] flex flex-col items-center justify-center gap-0.5"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[10.5px] font-black">Nhật ký</span>
            </button>
          </nav>
        </div>
      )}

      {/* 4. CHẾ ĐỘ TRANG TRÍ PHÒNG TRỰC QUAN (LIVE DECORATOR STUDIO DRAWER) */}
      <DecoratorDrawer
        isOpen={isDecoratorMode}
        onClose={() => {
          setIsDecoratorMode(false);
          setPreviewEquipped(null);
        }}
        roomData={roomData}
        activeSlot={activeDecoratorSlot}
        onSelectSlot={(slotId) => setActiveDecoratorSlot(slotId)}
        previewEquipped={previewEquipped}
        onPreviewItem={handlePreviewItem}
        onBuyAndEquip={handleBuyAndEquip}
        onEquipItem={handleEquipExisting}
        onSendMysteryGift={handleSendMysteryGift}
      />

      {/* 5. HỆ THỐNG iOS NATIVE BOTTOM SHEETS */}
      <StickyNoteModal
        isOpen={activeModal === 'sticky'}
        onClose={() => setActiveModal(null)}
        stickyNote={roomData?.stickyNote}
        currentPlayerName={session.playerName}
        onSaveStickyNote={handleSaveStickyNote}
      />

      <PhotoFrameModal
        isOpen={activeModal === 'photo'}
        onClose={() => setActiveModal(null)}
        photoFrame={roomData?.photoFrame}
        currentPlayerName={session.playerName}
        onSavePhotoFrame={handleSavePhotoFrame}
      />

      <GiftUnwrapModal
        isOpen={activeModal === 'gift'}
        onClose={() => setActiveModal(null)}
        mysteryGift={roomData?.mysteryGift}
        currentPlayerRole={session.playerRole}
        onConfirmUnwrap={handleConfirmUnwrapGift}
      />

      <ChatModal
        isOpen={activeModal === 'chat'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        onSendChat={handleSendChatToPet}
        isThinking={isAiThinking}
      />

      <LogModal
        isOpen={activeModal === 'log'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
      />

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
        session={session}
        timeOverride={timeOverride}
        onChangeTimeOverride={(val) => setTimeOverride(val)}
        onRenamePet={handleRenamePet}
        onSyncEncryptedKey={handleSyncEncryptedKey}
        onToggleDemoCoopPartner={handleToggleDemoCoopPartner}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* GÓC VUI CHƠI (ARCADE MODAL) */}
      <ArcadeModal
        isOpen={activeModal === 'arcade'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
        dailyEarnedCoins={dailyArcadeEarned}
        onStartSubwayRun={() => {
          setActiveModal(null);
          setActiveMiniGame('subwayRun');
        }}
      />

      {/* MINI-GAME TOÀN MÀN HÌNH: MOCHI CHẠY PHỐ (SUBWAY SURFERS 3 LÀN) */}
      {activeMiniGame === 'subwayRun' && (
        <SubwayRunGame
          petType={pet.type || 'cat'}
          petName={pet.name || 'Mochi'}
          playerName={session.playerName}
          partnerName={partnerInfo?.name || 'Người kia'}
          partnerBestScore={
            roomData?.minigames?.subwayRun?.highScores?.[partnerRole]?.score || 0
          }
          myBestScore={
            roomData?.minigames?.subwayRun?.highScores?.[session.playerRole]?.score || 0
          }
          dailyRemainingCap={dailyArcadeRemaining}
          onGameComplete={handleSubwayRunComplete}
          onExit={() => setActiveMiniGame(null)}
        />
      )}
    </div>
  );
}
