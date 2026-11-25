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
  Gamepad2,
  BellRing,
  Volume2,
  VolumeX,
  Home,
  ChefHat,
  ShoppingBasket
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
import MarketModal from './components/Modals/MarketModal';
import FridgeModal from './components/Modals/FridgeModal';
import CookingGameModal from './components/Modals/CookingGameModal';
import ServeBowlModal from './components/Modals/ServeBowlModal';
import SubwayRunGame from './components/minigames/SubwayRunGame';
import GrillSortGame from './components/minigames/GrillSortGame';
import SupermarketIdleGame from './components/minigames/supermarket/SupermarketIdleGame';
import DevCalibratorBar from './components/DevCalibratorBar';
import { loadMergedPetAnchors } from './data/petAnchors';
import { normalizeFridge } from './data/cookingData';

import {
  FOOD_CATALOG,
  ROOM_LIST,
  ROOM_SLOTS_BY_ROOM,
  getSlotRoom,
  computeDecayedState,
  resolveOfflineStateWithBowl,
  clampStat,
  evaluateCoopCareBonus,
  normalizeEquippedRoom,
  normalizeKitchenSlots,
  normalizeBathroomSlots,
  normalizeInventoryList
} from './utils/gameLogic';
import {
  subscribeToRoom,
  updateRoomFields,
  setupLivePresence,
  updatePlayerCurrentRoom,
  decodeSharedApiKey
} from './services/firebase';
import {
  askPetBrain,
  maybeBuildUpdatedMemorySummary
} from './services/petBrain';
import { soundEngine, useSoundSettings } from './services/soundEngine';
import {
  notifyPartner,
  clearAppBadgeSafe,
  getNudgeCooldownRemainingMin,
  markNudgeSentNow
} from './services/pushService';

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
  const [currentRoom, setCurrentRoom] = useState('living'); // 'living' | 'kitchen' | 'bathroom'
  const [activeActionEvent, setActiveActionEvent] = useState(null);
  const [activeDecoratorSlot, setActiveDecoratorSlot] = useState('wall');
  const [previewEquipped, setPreviewEquipped] = useState(null);
  const [isCalibratorOpen, setIsCalibratorOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('calibrate') === '1';
    } catch {
      return false;
    }
  });
  const [calibratorEmotion, setCalibratorEmotion] = useState('happy');
  const [calibratorAccessory, setCalibratorAccessory] = useState('acc_sprout');
  const [customAnchors, setCustomAnchors] = useState(() => loadMergedPetAnchors());
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [timeOverride, setTimeOverride] = useState('auto');
  const [comboToast, setComboToast] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [lastReadStickyTs, setLastReadStickyTs] = useState(() =>
    Number(localStorage.getItem(LAST_READ_STICKY_KEY) || 0)
  );

  const welcomeBackCheckedRef = useRef(false);
  const autoEatingRef = useRef(false);
  const lastBathTsRef = useRef(0);
  const offlineBowlKeyRef = useRef(null);
  const snd = useSoundSettings();

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

  // Tự động xóa chấm đỏ Badge ngoài màn hình chính khi mở lại PWA
  useEffect(() => {
    clearAppBadgeSafe();
    const handleVisibility = () => {
      if (!document.hidden) {
        clearAppBadgeSafe();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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
      const now = Date.now();
      const offlineRes = resolveOfflineStateWithBowl(data.pet, data.bowl, now);
      const decayedPet = offlineRes.pet || computeDecayedState(data.pet, now);

      if (offlineRes.ateBowlOffline && offlineRes.consumedBowl) {
        const bowlKey = `${offlineRes.consumedBowl.servedAt || offlineRes.consumedBowl.name}`;
        if (offlineBowlKeyRef.current !== bowlKey) {
          offlineBowlKeyRef.current = bowlKey;
          const ateTimeStr = new Date(offlineRes.ateAt || now).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          });
          const logEntry = {
            id: `log_autoeat_${now}`,
            actor: data.pet?.name || 'Mochi',
            action: `${ateTimeStr} - ${data.pet?.name || 'Mochi'} thấy bụng đói nên đã tự chạy ra bếp ăn sạch bát ${offlineRes.consumedBowl.name}!`,
            petComment: `Hồi nãy đói quá con tự ra bếp ăn sạch bát ${offlineRes.consumedBowl.name} rồi, ngon xỉu!`,
            timestamp: now
          };
          updateRoomFields(session.roomId, {
            bowl: null,
            'pet/hunger': decayedPet.hunger,
            'pet/mood': decayedPet.mood,
            'pet/lastUpdated': now,
            'pet/aiBubble': {
              dialogue: `Hồi nãy đói quá con tự ra bếp ăn sạch bát ${offlineRes.consumedBowl.name} rồi, ngon xỉu!`,
              emotion: 'happy',
              modelUsed: 'auto-eat',
              updatedAt: now
            },
            logs: [logEntry, ...(data.logs || [])].slice(0, 20)
          }).catch(() => {});
        }
      }

      setRoomData({
        ...data,
        pet: decayedPet || data.pet,
        bowl: offlineRes.ateBowlOffline ? null : data.bowl || null
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
  const partnerRoomMeta = ROOM_LIST.find((r) => r.id === (partnerInfo?.currentRoom || 'living'));

  const handleChangeRoom = useCallback(
    (nextRoom) => {
      if (!nextRoom || nextRoom === currentRoom) return;
      setCurrentRoom(nextRoom);
      setPreviewEquipped(null);
      const firstSlot = ROOM_SLOTS_BY_ROOM[nextRoom]?.[0]?.id;
      if (firstSlot) setActiveDecoratorSlot(firstSlot);
      if (session?.roomId && session?.playerRole) {
        updatePlayerCurrentRoom(session.roomId, session.playerRole, nextRoom);
      }
    },
    [currentRoom, session?.roomId, session?.playerRole]
  );

  // Đồng bộ bối cảnh nhạc nền: Ngày / Đêm (19h-6h hoặc thú đi ngủ) / Góc vui chơi & Mini-game
  useEffect(() => {
    const hour = new Date().getHours();
    let nightByClock = hour >= 19 || hour < 6;
    if (timeOverride === 'night') nightByClock = true;
    else if (timeOverride === 'day' || timeOverride === 'sunset') nightByClock = false;
    soundEngine.setGameContext({
      isNight: nightByClock || Boolean(roomData?.pet?.isSleeping),
      isArcade: Boolean(activeMiniGame) || activeModal === 'arcade'
    });
  }, [timeOverride, roomData?.pet?.isSleeping, activeMiniGame, activeModal]);

  const hasUnreadSticky = Boolean(
    roomData?.stickyNote?.updatedAt &&
      roomData.stickyNote.updatedAt > lastReadStickyTs &&
      roomData.stickyNote.author !== session?.playerName
  );

  const showToast = (text) => {
    setComboToast(text);
    setTimeout(() => setComboToast(null), 3200);
  };

  // Gọi người kia về nhà (Nudge Partner qua Web Push, Cooldown 15 phút)
  const handleNudgePartner = async () => {
    if (!roomData || !session) return;
    const remainingMin = getNudgeCooldownRemainingMin();
    if (remainingMin > 0) {
      soundEngine.play('error');
      showToast(`Vừa gọi rồi, đợi thêm ${remainingMin} phút nữa nha!`);
      return;
    }

    const res = await notifyPartner(roomData, session.roomId, session.playerRole, {
      title: `📣 ${session.playerName} gọi về nhà!`,
      body: `${roomData.pet?.name || 'Mochi'} đang ngóng bạn về vuốt đầu nè!`,
      tag: 'mochi-nudge',
      force: true
    });

    if (res?.reason === 'no-subscription') {
      showToast('Người kia chưa bật Thông báo màn hình khóa trong Cài đặt!');
      return;
    }
    if (res?.reason === 'no-worker-url') {
      showToast('Hãy cài đặt Cloudflare Worker trong mục Cài đặt trước nhé!');
      return;
    }
    if (res?.ok) {
      markNudgeSentNow();
      soundEngine.play('nudge');
      showToast(`Đã rung chuông gọi ${partnerInfo?.name || 'người kia'} về nhà!`);
    } else {
      showToast('Không gửi được thông báo lúc này, kiểm tra lại Worker trong Cài đặt nhé!');
    }
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
          sharedApiKey: sharedKey,
          currentRoom
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
      soundEngine.play('error');
      showToast('Chưa đủ Xu chung rồi! Hãy chăm thú hoặc dọn phòng để nhận thêm Xu nhé.');
      return;
    }

    const now = Date.now();
    soundEngine.play('eat');
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
    handleChangeRoom('kitchen');
    setActiveActionEvent({ type: 'feed', id: now });

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
    if (type === 'bath') soundEngine.play('bath');
    else if (type === 'clean_all') soundEngine.play('sparkle');
    else if (type === 'toggle_sleep' && !roomData.pet?.isSleeping) soundEngine.play('sleep');
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
      handleChangeRoom('bathroom');
      setActiveActionEvent({ type: 'bath', id: now });
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
      if (nextSleep) handleChangeRoom('living');
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

  // 3B. Tắm trực tiếp khi chạm vào Bồn tắm trong Phòng Tắm (+35 Sạch, +10 Vui, cooldown 2 phút)
  const handleDirectBathPet = async () => {
    if (!roomData || !session) return;
    const currentHygiene = roomData.pet?.hygiene ?? 85;
    if (currentHygiene >= 95) {
      showToast(`${roomData.pet?.name || 'Mochi'} đang thơm phức sạch bóng rồi!`);
      return;
    }
    const now = Date.now();
    if (now - lastBathTsRef.current < 2 * 60 * 1000) {
      showToast('Bé vừa tắm xong đó, nghịch bong bóng một lát rồi tắm tiếp nha!');
      return;
    }
    lastBathTsRef.current = now;
    const bonus = evaluateCoopCareBonus(roomData, session.playerRole, 8);
    const nextHygiene = clampStat(currentHygiene + 35);
    const nextMood = clampStat((roomData.pet?.mood ?? 80) + 10);
    const nextCoins = (roomData.coins ?? 0) + bonus.earnedCoins;

    setActiveActionEvent({ type: 'bath', id: now });
    await updateRoomFields(session.roomId, {
      coins: nextCoins,
      streak: bonus.nextStreak,
      streakDate: bonus.streakDate,
      todayComboCounted: bonus.todayComboCounted,
      'pet/hygiene': nextHygiene,
      'pet/mood': nextMood,
      'pet/isSleeping': false,
      'pet/lastCareBy': session.playerRole,
      'pet/lastUpdated': now
    });

    showToast(`Bé nhảy tùm vào bồn tắm bọt! (+35 Sạch, +10 Vui, +${bonus.earnedCoins} Xu)`);
    const logEntry = {
      id: `log_bath_${now}`,
      actor: session.playerName,
      action: `đã tắm bọt xà phòng cho ${roomData.pet?.name || 'Mochi'} trong Phòng Tắm!`,
      timestamp: now
    };
    triggerPetAiReaction({
      snapshotRoom: {
        ...roomData,
        coins: nextCoins,
        pet: { ...roomData.pet, hygiene: nextHygiene, mood: nextMood, isSleeping: false }
      },
      triggerType: 'care',
      actionDetail: 'tắm bồn xà phòng thơm phức cùng vịt cao su',
      logEntry
    });
  };

  // 3C. Đi Chợ Thực Phẩm -> cất thẳng vào Tủ Lạnh (/rooms/{roomId}/fridge)
  const handleBuyMarketItem = async (category, item, qty = 1) => {
    if (!roomData || !session) return;
    const cost = item.price * qty;
    if ((roomData.coins ?? 0) < cost) {
      showToast('Chưa đủ Xu chung rồi! Hãy chơi mini-game hoặc chăm bé để nhận thêm Xu nhé.');
      return;
    }
    const fridge = normalizeFridge(roomData.fridge);
    const nextFridge = {
      ...fridge,
      [category]: {
        ...fridge[category],
        [item.id]: (fridge[category]?.[item.id] || 0) + qty
      }
    };
    await updateRoomFields(session.roomId, {
      coins: (roomData.coins ?? 0) - cost,
      fridge: nextFridge
    });
    showToast(`Đã mua x${qty} ${item.name} cất vào Tủ Lạnh!`);
  };

  // 3D. Hoàn thành Mini-game Nấu Pate trên Bếp -> trừ nguyên liệu, cất hũ Pate vào Tủ Lạnh
  const handleFinishCooking = async ({ recipe, quality, bonusCoins, cookedBy }) => {
    if (!roomData || !session || !recipe) return;
    const now = Date.now();
    const fridge = normalizeFridge(roomData.fridge);
    const nextIngredients = { ...fridge.ingredients };
    Object.entries(recipe.ingredients).forEach(([ingId, req]) => {
      nextIngredients[ingId] = Math.max(0, (nextIngredients[ingId] || 0) - req);
    });

    const newDish = {
      id: `dish_${now}`,
      recipeId: recipe.id,
      name: recipe.name,
      quality,
      portions: recipe.portions,
      cookedBy: cookedBy || session.playerName,
      cookedAt: now
    };

    const nextFridge = {
      ...fridge,
      ingredients: nextIngredients,
      cookedDishes: [newDish, ...fridge.cookedDishes].slice(0, 20)
    };

    const starsText = '⭐'.repeat(quality);
    const logEntry = {
      id: `log_cook_${now}`,
      actor: session.playerName,
      action: `vừa trổ tài nấu ${recipe.portions} phần ${recipe.name} ${starsText} cất tủ lạnh!`,
      petComment:
        quality === 3
          ? 'Mùi Pate thượng hạng thơm nức cả nhà, mau đổ ra bát cho con ăn đi!'
          : quality === 1
          ? 'Hơi có mùi khét khét nhẹ nha... nhưng con vẫn nể mặt ăn thử!'
          : 'Thơm quá đi! Đầu bếp nhà mình khéo tay ghê!',
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      coins: (roomData.coins ?? 0) + (bonusCoins || 0),
      fridge: nextFridge,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    });

    if (quality === 3) {
      notifyPartner(roomData, session.roomId, session.playerRole, {
        title: `🍲 ${session.playerName} vừa nấu Pate 3 sao!`,
        body: `${recipe.portions} phần ${recipe.name} đang chờ trong Tủ Lạnh, vào đổ bát nhận x2 Xu nha!`,
        tag: 'mochi-cook'
      });
    }
  };

  // 3E. Đổ 1 phần thức ăn từ Tủ Lạnh ra Bát (/rooms/{roomId}/bowl)
  const handleServeToBowl = async (serving) => {
    if (!roomData || !session || !serving) return;
    const now = Date.now();
    const fridge = normalizeFridge(roomData.fridge);
    const nextFridge = { ...fridge };

    if (serving.foodType === 'cooked') {
      nextFridge.cookedDishes = fridge.cookedDishes
        .map((d) => (d.id === serving.dishId ? { ...d, portions: (d.portions || 1) - 1 } : d))
        .filter((d) => d.portions > 0);
    } else {
      nextFridge.fastFood = {
        ...fridge.fastFood,
        [serving.itemId]: Math.max(0, (fridge.fastFood[serving.itemId] || 0) - 1)
      };
    }

    const bowlPayload = {
      foodType: serving.foodType,
      itemId: serving.itemId,
      name: serving.name,
      quality: serving.quality || 2,
      hungerGain: serving.hungerGain,
      moodGain: serving.moodGain,
      cookedBy: serving.cookedBy || null,
      servedBy: session.playerName,
      servedAt: now
    };

    await updateRoomFields(session.roomId, {
      fridge: nextFridge,
      bowl: bowlPayload
    });

    if ((roomData.pet?.hunger ?? 80) >= 75) {
      showToast('No căng bụng rồi, để đó xíu đói bé tự ra chén sạch nha!');
    } else {
      showToast(`Đã đổ ${serving.name} ra bát, bé đang chạy tới ăn!`);
    }
  };

  // 3F. Dọn bát trả lại vào Tủ Lạnh nếu muốn đổi món khác
  const handleClearBowlToFridge = async () => {
    if (!roomData || !session || !roomData.bowl) return;
    const b = roomData.bowl;
    const fridge = normalizeFridge(roomData.fridge);
    const nextFridge = { ...fridge };

    if (b.foodType === 'cooked') {
      nextFridge.cookedDishes = [
        {
          id: `dish_ret_${Date.now()}`,
          recipeId: b.itemId,
          name: b.name,
          quality: b.quality || 2,
          portions: 1,
          cookedBy: b.cookedBy || session.playerName,
          cookedAt: Date.now()
        },
        ...fridge.cookedDishes
      ];
    } else {
      nextFridge.fastFood = {
        ...fridge.fastFood,
        [b.itemId]: (fridge.fastFood[b.itemId] || 0) + 1
      };
    }

    await updateRoomFields(session.roomId, {
      fridge: nextFridge,
      bowl: null
    });
    showToast(`Đã cất ${b.name} lại vào Tủ Lạnh!`);
  };

  // 3G. CƠ CHẾ MÈO ĐÓI TỰ TỚI BÁT ĂN REALTIME (khi ở Nhà Bếp, bowl !== null, hunger < 75, không ngủ)
  useEffect(() => {
    if (
      !roomData ||
      !session ||
      currentRoom !== 'kitchen' ||
      !roomData.bowl ||
      roomData.pet?.isSleeping ||
      autoEatingRef.current
    ) {
      return;
    }
    const currentHunger = roomData.pet?.hunger ?? 80;
    if (currentHunger >= 75) return;

    autoEatingRef.current = true;
    const activeBowl = roomData.bowl;
    const now = Date.now();
    soundEngine.play('eat');
    setActiveActionEvent({ type: 'feed', id: now });

    const eatTimer = setTimeout(async () => {
      try {
        const doneAt = Date.now();
        const isFamilyMeal = Boolean(
          activeBowl.cookedBy &&
            activeBowl.servedBy &&
            activeBowl.cookedBy !== activeBowl.servedBy
        );
        const bonus = evaluateCoopCareBonus(roomData, session.playerRole, 10);
        const familyExtra = isFamilyMeal ? 20 : 0;
        const nextCoins = (roomData.coins ?? 0) + bonus.earnedCoins + familyExtra;
        const nextHunger = clampStat(currentHunger + (activeBowl.hungerGain || 30));
        const nextMood = clampStat((roomData.pet?.mood ?? 80) + (activeBowl.moodGain || 10));

        await updateRoomFields(session.roomId, {
          bowl: null,
          coins: nextCoins,
          streak: bonus.nextStreak,
          streakDate: bonus.streakDate,
          todayComboCounted: bonus.todayComboCounted,
          'pet/hunger': nextHunger,
          'pet/mood': nextMood,
          'pet/lastCareBy': session.playerRole,
          'pet/lastUpdated': doneAt
        });

        if (isFamilyMeal) {
          soundEngine.play('coin');
          showToast(
            `BỮA CƠM GIA ĐÌNH x2 XU (+${bonus.earnedCoins + familyExtra} Xu)! ${activeBowl.cookedBy} nấu & ${activeBowl.servedBy} bày bát!`
          );
        } else {
          showToast(
            `${roomData.pet?.name || 'Mochi'} đã ăn sạch ${activeBowl.name}! (+${activeBowl.hungerGain} Đói)`
          );
        }

        const logEntry = {
          id: `log_eat_${doneAt}`,
          actor: roomData.pet?.name || 'Mochi',
          action: isFamilyMeal
            ? `đã ăn sạch bát ${activeBowl.name} (${activeBowl.cookedBy} nấu & ${activeBowl.servedBy} bày — Bữa Cơm Gia Đình +20 Xu!)`
            : `đã tự chạy ra bát ăn sạch ${activeBowl.name}${
                activeBowl.foodType === 'cooked' ? ` (${activeBowl.quality || 3}⭐)` : ''
              }!`,
          timestamp: doneAt
        };

        triggerPetAiReaction({
          snapshotRoom: {
            ...roomData,
            bowl: null,
            coins: nextCoins,
            pet: { ...roomData.pet, hunger: nextHunger, mood: nextMood }
          },
          triggerType: 'feed',
          actionDetail:
            activeBowl.foodType === 'cooked'
              ? `vừa ăn món Pate nhà làm "${activeBowl.name}" chất lượng ${activeBowl.quality || 3} sao do ${activeBowl.cookedBy} nấu`
              : `vừa ăn ${activeBowl.name} trong bát`,
          logEntry
        });
      } finally {
        autoEatingRef.current = false;
      }
    }, 2800);

    return () => {
      clearTimeout(eatTimer);
      autoEatingRef.current = false;
    };
  }, [
    currentRoom,
    roomData?.bowl?.servedAt,
    roomData?.pet?.hunger,
    roomData?.pet?.isSleeping,
    session?.roomId
  ]);

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

    soundEngine.play('coin');
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
    if ((roomData.coins ?? 0) < item.price) {
      soundEngine.play('error');
      return;
    }

    const now = Date.now();
    const nextCoins = (roomData.coins ?? 0) - item.price;
    const inventory = normalizeInventoryList([
      ...(roomData.room?.inventory || []),
      item.id
    ]);
    const slotRoom = getSlotRoom(item.slot);
    const logEntry = {
      id: `log_shop_${now}`,
      actor: session.playerName,
      action: `vừa sắm "${item.name}" trang hoàng phòng mới!`,
      petComment: `Oa, ${item.name} hợp với tổ ấm của mình ghê!`,
      timestamp: now
    };
    const updates = {
      coins: nextCoins,
      'room/inventory': inventory,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    };
    if (slotRoom === 'kitchen') {
      updates.kitchenSlots = {
        ...normalizeKitchenSlots(roomData.kitchenSlots),
        [item.slot]: item.id
      };
    } else if (slotRoom === 'bathroom') {
      updates.bathroomSlots = {
        ...normalizeBathroomSlots(roomData.bathroomSlots),
        [item.slot]: item.id
      };
    } else {
      updates['room/equipped'] = {
        ...normalizeEquippedRoom(roomData.room?.equipped),
        [item.slot]: item.id
      };
    }

    await updateRoomFields(session.roomId, updates);

    setPreviewEquipped(null);
    soundEngine.play('buy');
    showToast(`Đã mua và lắp "${item.name}" vào phòng!`);
  };

  const handleEquipExisting = async (item) => {
    if (!roomData || !session) return;
    const slotRoom = getSlotRoom(item.slot);
    const fieldKey =
      slotRoom === 'kitchen'
        ? `kitchenSlots/${item.slot}`
        : slotRoom === 'bathroom'
        ? `bathroomSlots/${item.slot}`
        : `room/equipped/${item.slot}`;
    await updateRoomFields(session.roomId, {
      [fieldKey]: item.id
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
    soundEngine.play('buy');
    showToast('Đã đặt Hộp Quà Bất Ngờ giữa phòng cho người kia bóc!');

    notifyPartner(roomData, session.roomId, session.playerRole, {
      title: '🎁 Có hộp quà bất ngờ giữa phòng!',
      body: `${session.playerName} vừa gói tặng bạn một món quà bí mật, vào bóc ngay!`,
      tag: 'mochi-gift'
    });
  };

  // 8. Bóc hộp quà bất ngờ
  const handleConfirmUnwrapGift = async (gift) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const inventory = normalizeInventoryList([
      ...(roomData.room?.inventory || []),
      gift.itemId
    ]);
    const giftRoom = getSlotRoom(gift.slot);
    const logEntry = {
      id: `log_unwrap_${now}`,
      actor: session.playerName,
      action: `đã bóc hộp quà "${gift.itemName}" từ ${gift.senderName}!`,
      timestamp: now
    };
    const unwrapUpdates = {
      'room/inventory': inventory,
      mysteryGift: null
    };
    if (giftRoom === 'kitchen') {
      unwrapUpdates.kitchenSlots = {
        ...normalizeKitchenSlots(roomData.kitchenSlots),
        [gift.slot]: gift.itemId
      };
    } else if (giftRoom === 'bathroom') {
      unwrapUpdates.bathroomSlots = {
        ...normalizeBathroomSlots(roomData.bathroomSlots),
        [gift.slot]: gift.itemId
      };
    } else {
      unwrapUpdates['room/equipped'] = {
        ...normalizeEquippedRoom(roomData.room?.equipped),
        [gift.slot]: gift.itemId
      };
    }

    await updateRoomFields(session.roomId, unwrapUpdates);
    soundEngine.play('giftOpen');
    handleChangeRoom(giftRoom);

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
    soundEngine.play('paper');
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
    soundEngine.play('paper');
    showToast('Đã ghim giấy nhớ mới lên bảng bần!');

    notifyPartner(roomData, session.roomId, session.playerRole, {
      title: `📝 ${session.playerName} vừa dán giấy nhớ mới!`,
      body:
        notePayload.mode === 'drawing'
          ? '[Tranh vẽ tay mới trên bảng bần]'
          : (notePayload.text || 'Vào xem giấy nhớ mới nè!').slice(0, 50),
      tag: 'mochi-sticky'
    });

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
    soundEngine.play('shutter');
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
      notifyPartner(roomData, session.roomId, session.playerRole, {
        title: '🏆 Kỷ lục của bạn vừa bị phá!',
        body: `${session.playerName} vừa vượt điểm bạn ở Mochi Chạy Phố (${score} điểm)!`,
        tag: 'mochi-record'
      });
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

  // 14. Kết thúc 1 màn "Bếp Nướng Mochi" (/rooms/{roomId}/minigames/grillSort)
  const handleGrillLevelComplete = async ({
    level,
    score,
    ordersCleared,
    rewardCoins,
    noBoosterBonus,
    passedPartnerLevel
  }) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const myRole = session.playerRole;
    const prevGrill = roomData?.minigames?.grillSort || {};
    const prevMine = prevGrill[myRole] || { maxLevel: 0, bestScore: 0 };
    const prevShared = Number(prevGrill.sharedOrdersCleared || 0);

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
      'minigames/dailyBonusCoins': dailyArcadeEarned + rewardCoins,
      'minigames/grillSort/sharedOrdersCleared': prevShared + ordersCleared,
      [`minigames/grillSort/${myRole}`]: {
        maxLevel: Math.max(prevMine.maxLevel || 0, level),
        bestScore: Math.max(prevMine.bestScore || 0, score),
        updatedAt: now
      }
    };

    const partnerDisplayName = partnerInfo?.name || 'người kia';
    const actionDesc = passedPartnerLevel
      ? `vừa phá đảo Màn ${level} Bếp Nướng Mochi (${score}đ) và vượt mặt kỷ lục màn của ${partnerDisplayName}!`
      : `vừa hoàn thành Màn ${level} Bếp Nướng Mochi (+${rewardCoins} Xu${
          noBoosterBonus ? ', không dùng Booster!' : ''
        })!`;

    const logEntry = {
      id: `log_grill_${now}`,
      actor: session.playerName,
      action: actionDesc,
      timestamp: now
    };

    if (!passedPartnerLevel) {
      updates.logs = [
        {
          ...logEntry,
          petComment: `Xiên nướng thơm phức cả phòng luôn! Hai chủ đã nướng chung ${prevShared + ordersCleared} đơn rồi đó!`
        },
        ...(roomData.logs || [])
      ].slice(0, 20);
    }

    await updateRoomFields(session.roomId, updates);

    if (passedPartnerLevel) {
      notifyPartner(roomData, session.roomId, session.playerRole, {
        title: '🏆 Kỷ lục của bạn vừa bị phá!',
        body: `${session.playerName} vừa vượt màn bạn ở Bếp Nướng Mochi (Màn ${level})!`,
        tag: 'mochi-record'
      });
      triggerPetAiReaction({
        snapshotRoom: {
          ...roomData,
          coins: nextCoins,
          pet: { ...roomData.pet, mood: nextMood, energy: nextEnergy }
        },
        triggerType: 'care',
        actionDetail: `${session.playerName} vừa vượt qua Màn ${level} Bếp Nướng Mochi, bỏ xa kỷ lục của ${partnerDisplayName}! Hãy bình luận cà khịa dễ thương!`,
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
    <div className="fixed inset-x-0 top-0 bottom-0 mx-auto w-full max-w-[430px] overflow-hidden select-none bg-[#C7A688] shadow-2xl">
      {/* 1. FULL-BLEED 2.5D ROOM CANVAS (Tràn viền 100dvh, không viền đen thô bao quanh) */}
      <div
        className={`w-full transition-all duration-300 ${
          isDecoratorMode || isCalibratorOpen ? 'h-[66%]' : 'h-full'
        }`}
      >
        <RoomStage
          roomData={roomData}
          currentRoom={currentRoom}
          onChangeRoom={handleChangeRoom}
          activeActionEvent={activeActionEvent}
          previewEquipped={
            isCalibratorOpen
              ? { ...(previewEquipped || {}), accessory: calibratorAccessory }
              : previewEquipped
          }
          isDecoratorMode={isDecoratorMode}
          activeDecoratorSlot={activeDecoratorSlot}
          onSelectDecoratorSlot={(slotId) => setActiveDecoratorSlot(slotId)}
          timeOverride={timeOverride}
          bothOnline={bothOnline}
          isTrayOpen={Boolean(activeTray) || isCalibratorOpen}
          isPhotoMode={isPhotoMode}
          calibratorEmotionOverride={isCalibratorOpen ? calibratorEmotion : null}
          customAnchors={customAnchors}
          onPetTap={handlePetTap}
          onCoopPlayBall={handleCoopPlayBall}
          onCleanTrash={handleCleanSingleTrash}
          onOpenStickyNote={handleOpenStickyModal}
          onOpenPhotoFrame={() => {
            soundEngine.play('shutter');
            setActiveModal('photo');
          }}
          onOpenGift={() => setActiveModal('gift')}
          onOpenChat={() => setActiveModal('chat')}
          onToggleSleep={() => handleCareAction('toggle_sleep')}
          onBathPet={handleDirectBathPet}
          onOpenFridge={() => setActiveModal('fridge')}
          onOpenCooking={() => setActiveModal('cooking')}
          onOpenServeBowl={() => setActiveModal('serveBowl')}
          hasUnreadSticky={hasUnreadSticky}
        />
      </div>

      {/* 2. FLOATING TOP BAR (z-[55] — Nằm trên lớp ánh sáng z-[40], tôn trọng safe-area-inset-top) */}
      <div
        style={{
          top: 'max(env(safe-area-inset-top, 12px), 12px)'
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

        <header
          className="flex flex-col gap-2 w-full"
          onClickCapture={() => soundEngine.play('tap')}
        >
          {/* HÀNG 1: Thông tin thú | Loa • Photo • Cài đặt */}
          <div className="flex items-center justify-between gap-2 w-full">
            {!isPhotoMode ? (
              <div className="pointer-events-auto cozy-glass rounded-full px-2.5 py-1.5 border-[2px] border-[#4A3525] flex items-center gap-2 shadow-sm min-w-0 whitespace-nowrap">
                <span className="text-xs font-black text-[#4A3525] truncate max-w-[76px]">
                  {pet.name || 'Mochi'}
                </span>
                <div className="h-3.5 w-[1.5px] bg-[#4A3525]/20 shrink-0" />
                <div
                  className="flex items-center gap-0.5 text-xs font-black text-[#E85D75] tabular-nums shrink-0"
                  title="Chuỗi ngày Co-op Streak"
                >
                  <Flame className="w-3.5 h-3.5 fill-[#FF9B71]" />
                  <span>{roomData?.streak ?? 1}</span>
                </div>
                <div className="h-3.5 w-[1.5px] bg-[#4A3525]/20 shrink-0" />
                <div
                  className="flex items-center gap-1 text-xs font-black text-[#4A3525] shrink-0"
                  title="Ngân quỹ Xu chung"
                >
                  <Coins className="w-3.5 h-3.5 text-[#E87A4D]" />
                  <AnimatedCoinCounter value={roomData?.coins ?? 120} />
                </div>
              </div>
            ) : (
              <div />
            )}

            <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
              {!isPhotoMode && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.setSettings({ muted: !snd.muted });
                    if (snd.muted) soundEngine.play('tap');
                  }}
                  className="cozy-glass w-8 h-8 rounded-full border-[2px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90 transition-transform"
                  title={snd.muted ? 'Bật âm thanh' : 'Tắt toàn bộ âm thanh'}
                >
                  {snd.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
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
                className="cozy-glass w-8 h-8 rounded-full border-[2px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90 transition-transform"
                title={isPhotoMode ? 'Hiện lại giao diện' : 'Ẩn HUD để ngắm phòng / chụp ảnh'}
              >
                {isPhotoMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {!isPhotoMode && (
                <button
                  type="button"
                  onClick={() => setActiveModal('settings')}
                  className="cozy-glass w-8 h-8 rounded-full border-[2px] border-[#4A3525] flex items-center justify-center text-[#4A3525] active:scale-90 transition-transform"
                  title="Cài đặt phòng & Bộ não AI"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* HÀNG 2: Partner + Chuông gọi về nhà | Góc Vui Chơi */}
          {!isPhotoMode && (
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="pointer-events-auto flex items-center gap-1.5 min-w-0">
                <div className="cozy-glass rounded-full h-7 px-2.5 border-[2px] border-[#4A3525] flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border border-[#4A3525] shrink-0 ${
                      isPartnerOnline ? 'bg-[#88C9A1] animate-pulse' : 'bg-[#D6C7B8]'
                    }`}
                  />
                  <span className="text-xs font-black text-[#4A3525] truncate max-w-[140px] whitespace-nowrap">
                    {bothOnline
                      ? `${partnerInfo?.name || 'Đang ở nhà'} (${partnerRoomMeta?.shortLabel || 'Phòng khách'})`
                      : partnerInfo?.name
                      ? partnerInfo.name
                      : session.roomId}
                  </span>
                </div>
                {!isPartnerOnline && (
                  <button
                    type="button"
                    onClick={handleNudgePartner}
                    className="cozy-glass h-7 px-2.5 rounded-full border-[2px] border-[#4A3525] bg-[#FFB7C5]/90 flex items-center gap-1 text-xs font-black text-[#4A3525] active:scale-90 transition-transform whitespace-nowrap shrink-0"
                    title={`Gọi ${partnerInfo?.name || 'người kia'} về nhà`}
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Gọi</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTray(null);
                  setActiveModal('arcade');
                }}
                className="pointer-events-auto cozy-glass h-7 px-3 rounded-full border-[2px] border-[#4A3525] bg-[#FFE082]/90 flex items-center gap-1 text-xs font-black text-[#4A3525] active:scale-90 transition-transform whitespace-nowrap shrink-0"
                title="Góc Vui Chơi • Mini-game"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Chơi game</span>
              </button>
            </div>
          )}
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
      {!isPhotoMode && !isDecoratorMode && !isCalibratorOpen && (
        <div
          style={{
            bottom: 'max(env(safe-area-inset-bottom, 10px), 10px)'
          }}
          className="absolute inset-x-0 z-[55] px-3 pointer-events-none flex flex-col gap-1.5"
        >
          {/* CHẤM CHỈ BÁO PHÒNG + GỢI Ý NHU CẦU (Needs Indicators) */}
          <div className="pointer-events-auto mx-auto flex items-center gap-2 px-3 py-1 rounded-full cozy-glass border-[1.5px] border-[#4A3525]/80 shadow-sm">
            <span className="text-[10px] font-black text-[#4A3525] whitespace-nowrap">
              ‹ {ROOM_LIST.find((r) => r.id === currentRoom)?.label || 'Phòng khách'} ›
            </span>
            <div className="flex items-center gap-1.5">
              {ROOM_LIST.map((rm) => {
                const needsAttention =
                  (rm.id === 'kitchen' && (pet.hunger ?? 80) < 40) ||
                  (rm.id === 'bathroom' && (pet.hygiene ?? 90) < 40) ||
                  (rm.id === 'living' && (pet.energy ?? 85) < 40);
                return (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => {
                      if (currentRoom !== rm.id) {
                        soundEngine.play('sheetOpen');
                        handleChangeRoom(rm.id);
                      }
                    }}
                    title={rm.label}
                    className={`relative h-2 rounded-full transition-all ${
                      currentRoom === rm.id
                        ? 'w-5 bg-[#FF9B71] border border-[#4A3525]'
                        : needsAttention
                        ? 'w-2.5 bg-[#E85D75] animate-ping'
                        : 'w-2 bg-[#4A3525]/25'
                    }`}
                  />
                );
              })}
            </div>
            {(pet.hunger ?? 80) < 40 && currentRoom !== 'kitchen' && (
              <span className="text-[9.5px] font-black text-[#E85D75] whitespace-nowrap animate-pulse">
                • Bếp
              </span>
            )}
            {(pet.hygiene ?? 90) < 40 && currentRoom !== 'bathroom' && (
              <span className="text-[9.5px] font-black text-[#E85D75] whitespace-nowrap animate-pulse">
                • Tắm
              </span>
            )}
            {(pet.energy ?? 85) < 40 && currentRoom !== 'living' && (
              <span className="text-[9.5px] font-black text-[#E85D75] whitespace-nowrap animate-pulse">
                • Ngủ
              </span>
            )}
          </div>

          {/* THANH 4 CHỈ SỐ TINH GỌN */}
          <div className="pointer-events-auto grid grid-cols-4 gap-1.5 w-full">
            {statItems.map((st) => {
              const IconComp = st.icon;
              const isLow = st.value < 30;
              return (
                <div
                  key={st.id}
                  className={`cozy-glass rounded-2xl px-2 py-1.5 border-[1.8px] transition-all min-w-0 ${
                    isLow
                      ? 'border-[#E85D75] bg-[#FFF0F3]/95 animate-bounce'
                      : 'border-[#4A3525]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] whitespace-nowrap font-black text-[#4A3525] mb-1">
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

          {/* TACTILE BOTTOM DOCK (4 NÚT RỘNG RÃI: Đi Chợ | Trang trí | Trò chuyện | Nhật ký) */}
          <nav
            onClickCapture={() => soundEngine.play('tap')}
            className="pointer-events-auto cozy-glass rounded-[28px] p-1.5 border-[2.4px] border-[#4A3525] grid grid-cols-4 gap-2"
          >
            <button
              type="button"
              onClick={() => {
                setActiveTray(null);
                setActiveModal('market');
              }}
              className="tactile-btn py-2 rounded-[20px] border-[1.8px] border-[#4A3525] bg-[#88C9A1] text-[#4A3525] flex flex-col items-center justify-center gap-0.5"
            >
              <ShoppingBasket className="w-4 h-4" />
              <span className="text-[10.5px] leading-tight whitespace-nowrap font-black">Đi Chợ</span>
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
              <span className="text-[10.5px] leading-tight whitespace-nowrap font-black">Trang trí</span>
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
              <span className="text-[10.5px] leading-tight whitespace-nowrap font-black">Trò chuyện</span>
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
              <span className="text-[10.5px] leading-tight whitespace-nowrap font-black">Nhật ký</span>
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
        currentRoom={currentRoom}
        onChangeRoom={handleChangeRoom}
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

      {/* HỆ THỐNG ĐI CHỢ -> TỦ LẠNH -> NẤU PATE -> ĐỔ BÁT */}
      <MarketModal
        isOpen={activeModal === 'market'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
        onBuyMarketItem={handleBuyMarketItem}
        onOpenFridge={() => setActiveModal('fridge')}
        onOpenSupermarket={() => {
          setActiveModal(null);
          setActiveMiniGame('supermarket');
        }}
      />

      <FridgeModal
        isOpen={activeModal === 'fridge'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
        onOpenMarket={() => setActiveModal('market')}
        onOpenStickyNote={handleOpenStickyModal}
        onOpenCooking={() => setActiveModal('cooking')}
      />

      <CookingGameModal
        isOpen={activeModal === 'cooking'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
        playerName={session.playerName}
        onFinishCooking={handleFinishCooking}
        onOpenMarket={() => setActiveModal('market')}
      />

      <ServeBowlModal
        isOpen={activeModal === 'serveBowl'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
        onServeToBowl={handleServeToBowl}
        onClearBowlToFridge={handleClearBowlToFridge}
        onOpenCooking={() => setActiveModal('cooking')}
        onOpenMarket={() => setActiveModal('market')}
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
        onOpenDevCalibrator={() => {
          setIsDecoratorMode(false);
          setActiveTray(null);
          setIsCalibratorOpen(true);
        }}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* CÔNG CỤ CĂN CHỈNH ĐIỂM NEO PHỤ KIỆN TRỰC QUAN (?calibrate=1 hoặc Settings) */}
      <DevCalibratorBar
        isOpen={isCalibratorOpen}
        onClose={() => setIsCalibratorOpen(false)}
        petType={pet.type || 'cat'}
        selectedEmotion={calibratorEmotion}
        onSelectEmotion={(em) => setCalibratorEmotion(em)}
        selectedAccessory={calibratorAccessory}
        onSelectAccessory={(acc) => setCalibratorAccessory(acc)}
        anchors={customAnchors}
        onChangeAnchors={(next) => setCustomAnchors(next)}
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
        onStartGrillSort={() => {
          setActiveModal(null);
          setActiveMiniGame('grillSort');
        }}
        onStartSupermarket={() => {
          setActiveModal(null);
          setActiveMiniGame('supermarket');
        }}
      />

      {/* MINI-GAME 1: MOCHI CHẠY PHỐ (SUBWAY SURFERS 3 LÀN) */}
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

      {/* MINI-GAME 2: BẾP NƯỚNG MOCHI (BBQ TRIPLE-MATCH SORT PUZZLE) */}
      {activeMiniGame === 'grillSort' && (
        <GrillSortGame
          initialLevel={
            (roomData?.minigames?.grillSort?.[session.playerRole]?.maxLevel || 0) + 1
          }
          petName={pet.name || 'Mochi'}
          playerName={session.playerName}
          partnerName={partnerInfo?.name || 'Người kia'}
          partnerMaxLevel={
            roomData?.minigames?.grillSort?.[partnerRole]?.maxLevel || 0
          }
          dailyRemainingCap={dailyArcadeRemaining}
          onLevelComplete={handleGrillLevelComplete}
          onExit={() => setActiveMiniGame(null)}
        />
      )}

      {/* MINI-GAME 3: SIÊU THỊ MOCHI (CO-OP IDLE TYCOON) */}
      {activeMiniGame === 'supermarket' && (
        <SupermarketIdleGame
          roomId={session.roomId}
          roomData={roomData}
          playerRole={session.playerRole}
          playerName={session.playerName}
          partnerName={partnerInfo?.name || 'Người kia'}
          onExit={() => setActiveMiniGame(null)}
        />
      )}
    </div>
  );
}
