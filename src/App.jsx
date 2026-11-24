import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Flame,
  Coins,
  Settings,
  Utensils,
  Sparkles,
  MessageCircleHeart,
  ShoppingBag,
  BookOpen,
  Heart,
  Smile,
  Bath,
  Moon,
  Sun,
  Share,
  X
} from 'lucide-react';
import Onboarding from './components/Onboarding';
import RoomStage from './components/RoomStage';
import ShopModal from './components/Modals/ShopModal';
import StickyNoteModal from './components/Modals/StickyNoteModal';
import PhotoFrameModal from './components/Modals/PhotoFrameModal';
import GiftUnwrapModal from './components/Modals/GiftUnwrapModal';
import ChatModal from './components/Modals/ChatModal';
import LogModal from './components/Modals/LogModal';
import SettingsModal from './components/Modals/SettingsModal';

import {
  FOOD_CATALOG,
  computeDecayedState,
  clampStat,
  evaluateCoopCareBonus
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
  const [activeModal, setActiveModal] = useState(null); // 'shop' | 'sticky' | 'photo' | 'gift' | 'chat' | 'log' | 'settings'
  const [comboToast, setComboToast] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);

  const welcomeBackCheckedRef = useRef(false);

  // Phát hiện Safari iOS chưa chạy ở chế độ standalone để hiện banner hướng dẫn
  useEffect(() => {
    const dismissed = localStorage.getItem(IOS_BANNER_DISMISSED_KEY);
    if (dismissed) return;

    const ua = window.navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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

  // Lưu định danh vào localStorage để lần sau mở app vào thẳng phòng
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

  // Kiểm tra người kia đang online
  const partnerRole = session?.playerRole === 'player1' ? 'player2' : 'player1';
  const partnerInfo = roomData?.players?.[partnerRole] || null;
  const isPartnerOnline = Boolean(partnerInfo?.online);
  const bothOnline = Boolean(session && isPartnerOnline);

  const showToast = (text) => {
    setComboToast(text);
    setTimeout(() => setComboToast(null), 3200);
  };

  // Hàm gọi AI Pet Brain và đồng bộ bong bóng thoại lên Firebase để máy kia thấy chung
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

        // Nếu có dòng nhật ký đi kèm, gắn lời bình luận cà khịa của thú cưng vào
        if (logEntry) {
          const currentLogs = Array.isArray(snapshotRoom.logs) ? [...snapshotRoom.logs] : [];
          const enrichedLog = {
            ...logEntry,
            petComment: aiResult.dialogue
          };
          updates.logs = [enrichedLog, ...currentLogs].slice(0, 20);
        }

        // Kiểm tra cập nhật tóm tắt ký ức tối đa 1 lần / 24h
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

  // 1. Thao tác Xoa đầu thú cưng
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

  // 2. Thao tác Cho ăn
  const handleFeedPet = async (food) => {
    if (!roomData || !session) return;
    const currentCoins = roomData.coins ?? 0;
    if (currentCoins < food.price) {
      showToast('⚠️ Chưa đủ Xu chung rồi! Hãy chăm thú hoặc dọn phòng để nhận thêm Xu nhé.');
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
      showToast(`🔥 CO-OP COMBO x2 XU! (+${bonus.earnedCoins} Xu) • Streak ${bonus.nextStreak} ngày!`);
    } else {
      showToast(`🍽️ Đã thưởng ${food.name} (+${bonus.earnedCoins} Xu chăm sóc)`);
    }

    const logEntry = {
      id: `log_feed_${now}`,
      actor: session.playerName,
      action: `đã cho ${roomData.pet?.name || 'Mochi'} ăn ${food.name} ${food.icon}${
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

  // 3. Thao tác Chăm sóc (Tắm rửa / Dọn phòng / Bật-tắt đèn ngủ)
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
      actionDesc = `đã tắm thơm phức bằng sữa tắm bọt hồng cho ${roomData.pet?.name || 'Mochi'} 🛁`;
    } else if (type === 'clean_all') {
      const trashCount = (roomData.pet?.trashList || []).length;
      const extraTrashCoins = trashCount * 5;
      updates.coins += extraTrashCoins;
      updates['pet/trashList'] = [];
      updates['pet/hygiene'] = clampStat((roomData.pet?.hygiene ?? 80) + 15);
      actionDesc = `đã quét dọn sạch bóng căn phòng (+${bonus.earnedCoins + extraTrashCoins} Xu) 🧹`;
    } else if (type === 'toggle_sleep') {
      const nextSleep = !roomData.pet?.isSleeping;
      updates['pet/isSleeping'] = nextSleep;
      updates['pet/energy'] = clampStat((roomData.pet?.energy ?? 80) + (nextSleep ? 12 : 0));
      actionDesc = nextSleep
        ? `đã tắt đèn đắp chăn cho ${roomData.pet?.name || 'Mochi'} đi ngủ 🌙`
        : `đã bật đèn đánh thức ${roomData.pet?.name || 'Mochi'} dậy chơi ☀️`;
    }

    await updateRoomFields(session.roomId, updates);
    setActiveTray(null);

    if (bonus.isCoopCombo) {
      showToast(`🔥 CO-OP COMBO x2! (+${bonus.earnedCoins} Xu) • Phối hợp ăn ý quá!`);
    } else {
      showToast(`✨ Chăm sóc hoàn tất (+${bonus.earnedCoins} Xu)`);
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

  // 4. Chạm trực tiếp vào cục rác/bụi trên sàn (+5 Xu/cục)
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
    showToast('🧹 Dọn sạch 1 cục bụi trên sàn (+5 Xu)!');
  };

  // 5. Nút tương tác đôi khi cả 2 cùng Online: Cùng chơi tung bóng (+20 Xu chung)
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

    showToast('🎾 Cả hai cùng chơi tung bóng với bé! (+20 Xu chung)');

    const logEntry = {
      id: `log_ball_${now}`,
      actor: `${session.playerName} & ${partnerInfo?.name || 'Chủ 2'}`,
      action: `cùng online chơi tung bóng đôi với ${roomData.pet?.name || 'Mochi'} (+20 Xu)! 🎾`,
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

  // 6. Mua và lắp đồ nội thất
  const handleBuyAndEquip = async (item) => {
    if (!roomData || !session) return;
    if ((roomData.coins ?? 0) < item.price) return;

    const now = Date.now();
    const nextCoins = (roomData.coins ?? 0) - item.price;
    const inventory = Array.from(new Set([...(roomData.room?.inventory || []), item.id]));
    const equipped = { ...(roomData.room?.equipped || {}), [item.slot]: item.id };

    const logEntry = {
      id: `log_shop_${now}`,
      actor: session.playerName,
      action: `vừa sắm "${item.name}" trang hoàng phòng mới! 🛋️`,
      petComment: `Oa, ${item.name} hợp với màu lông của con ghê!`,
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      coins: nextCoins,
      'room/inventory': inventory,
      'room/equipped': equipped,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    });

    showToast(`🏠 Đã mua và lắp "${item.name}" vào phòng!`);
  };

  const handleEquipExisting = async (item) => {
    if (!roomData || !session) return;
    await updateRoomFields(session.roomId, {
      [`room/equipped/${item.slot}`]: item.id
    });
    showToast(`✨ Đã đổi sang "${item.name}"`);
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
      action: `đã đặt một Hộp Quà Bất Ngờ giữa phòng cho người kia! 🎁`,
      petComment: 'Suỵt! Con biết trong hộp có gì nhưng không bật mí đâu~',
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      coins: nextCoins,
      mysteryGift: giftPayload,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    });
  };

  // 8. Bóc hộp quà bất ngờ
  const handleConfirmUnwrapGift = async (gift) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const inventory = Array.from(new Set([...(roomData.room?.inventory || []), gift.itemId]));
    const equipped = { ...(roomData.room?.equipped || {}), [gift.slot]: gift.itemId };

    const logEntry = {
      id: `log_unwrap_${now}`,
      actor: session.playerName,
      action: `đã bóc hộp quà "${gift.itemName}" từ ${gift.senderName}! 🎉`,
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

  // 9. Lưu Giấy nhớ tủ lạnh
  const handleSaveStickyNote = async (notePayload) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const stickyNote = {
      ...notePayload,
      author: session.playerName,
      updatedAt: now
    };

    await updateRoomFields(session.roomId, { stickyNote });
    showToast('💌 Đã dán giấy nhớ mới lên tường!');

    const logEntry = {
      id: `log_note_${now}`,
      actor: session.playerName,
      action:
        notePayload.mode === 'drawing'
          ? 'đã vẽ một bức tranh Doodle mới lên giấy nhớ! 🎨'
          : `đã dán giấy nhớ mới: "${notePayload.text.slice(0, 40)}" 📝`,
      timestamp: now
    };

    triggerPetAiReaction({
      snapshotRoom: { ...roomData, stickyNote },
      triggerType: 'sticky_note',
      actionDetail: `dán giấy nhớ mới: "${notePayload.text}"`,
      logEntry
    });
  };

  // 10. Lưu ảnh khung tranh WebP Base64
  const handleSavePhotoFrame = async (photoPayload) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const logEntry = {
      id: `log_photo_${now}`,
      actor: session.playerName,
      action: `vừa treo ảnh mới lên khung tranh: "${photoPayload.caption}" 🖼️`,
      petComment: 'Hai chủ chụp ảnh đẹp đôi quá chừng, cho con chụp ké với!',
      timestamp: now
    };

    await updateRoomFields(session.roomId, {
      photoFrame: photoPayload,
      logs: [logEntry, ...(roomData.logs || [])].slice(0, 20)
    });
    showToast('🖼️ Đã cập nhật ảnh kỷ niệm trên tường!');
  };

  // 11. Chat trực tiếp với bộ não AI của Pet
  const handleSendChatToPet = async (userMessage) => {
    if (!roomData || !session) return;
    const now = Date.now();
    const logEntry = {
      id: `log_chat_${now}`,
      actor: session.playerName,
      action: `tâm sự với ${roomData.pet?.name || 'Mochi'}: "${userMessage}" 💬`,
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
    showToast(`🐾 Đã đổi tên bé thành "${newName}"!`);
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
        ? '🟢 Người kia đang ở nhà cùng bạn! Đã mở khóa "Cùng chơi tung bóng"!'
        : '⚪ Người kia đã tạm rời phòng.'
    );
  };

  // Nếu chưa có session phòng -> hiển thị màn hình Onboarding
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
      barColor: (pet.hunger ?? 80) < 25 ? 'bg-rose-500' : 'bg-orange-400'
    },
    {
      id: 'mood',
      label: 'Vui',
      value: pet.mood ?? 85,
      icon: Smile,
      barColor: (pet.mood ?? 85) < 25 ? 'bg-rose-500' : 'bg-pink-400'
    },
    {
      id: 'hygiene',
      label: 'Sạch',
      value: pet.hygiene ?? 90,
      icon: Bath,
      barColor: (pet.hygiene ?? 90) < 25 ? 'bg-rose-500' : 'bg-emerald-400'
    },
    {
      id: 'energy',
      label: 'Ngủ',
      value: pet.energy ?? 85,
      icon: Moon,
      barColor: (pet.energy ?? 85) < 25 ? 'bg-rose-500' : 'bg-sky-400'
    }
  ];

  return (
    <div className="app-shell w-full max-w-md mx-auto flex flex-col justify-between px-3 select-none overflow-hidden relative">
      {/* Banner hướng dẫn PWA trên iOS Safari nếu chưa chạy standalone */}
      {showIosBanner && (
        <div className="mb-1.5 px-3 py-1.5 rounded-2xl bg-amber-900 text-amber-50 text-[11px] font-bold flex items-center justify-between gap-2 shadow-md shrink-0">
          <div className="flex items-center gap-1.5">
            <Share className="w-3.5 h-3.5 text-orange-300 shrink-0" />
            <span>
              Bấm <strong>Chia sẻ</strong> → <strong>Thêm vào MH chính</strong> để chơi toàn màn hình như app!
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

      {/* 1. HEADER GỌN TRÊN CÙNG */}
      <header className="bg-white/90 backdrop-blur-md rounded-3xl px-3.5 py-2 border-2 border-orange-200/80 shadow-sm flex items-center justify-between gap-2 shrink-0">
        {/* Tên thú & Trạng thái Co-op Online của người kia */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center text-lg">
              {pet.type === 'corgi' ? '🐶' : pet.type === 'bunny' ? '🐰' : '🐱'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                isPartnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
              }`}
              title={isPartnerOnline ? 'Người kia đang Online' : 'Người kia đang Offline'}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-amber-950 truncate">
                {pet.name || 'Mochi'}
              </h1>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {session.roomId}
              </span>
            </div>
            <div className="text-[10px] font-bold text-amber-800/85 truncate flex items-center gap-1">
              {bothOnline ? (
                <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 fill-emerald-500" />
                  Đang ở nhà cùng {partnerInfo?.name || 'người kia'}
                </span>
              ) : partnerInfo?.name ? (
                <span>Nhà của {session.playerName} & {partnerInfo.name}</span>
              ) : (
                <span>Chờ người thứ 2 vào mã {session.roomId}</span>
              )}
            </div>
          </div>
        </div>

        {/* Streak lửa + Tổng Xu + Nút Cài đặt */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-black"
            title="Chuỗi ngày Co-op Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-rose-500" />
            <span>{roomData?.streak ?? 1}</span>
          </div>

          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black"
            title="Ngân quỹ Xu chung của 2 người"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{roomData?.coins ?? 120}</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            className="p-2 rounded-2xl bg-amber-100/80 hover:bg-orange-100 text-amber-900 active:scale-95 transition-transform"
            title="Cài đặt phòng & Bộ não AI"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Thông báo nổi (Co-op Combo / Thưởng Xu) */}
      {comboToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xs bg-amber-950/95 text-white text-xs font-extrabold px-3.5 py-2 rounded-2xl shadow-xl text-center animate-bounce">
          {comboToast}
        </div>
      )}

      {/* 2. SÂN KHẤU CĂN PHÒNG 2D (Chiếm ~63% chiều cao) */}
      <main className="my-2 flex-1 min-h-0 relative">
        <RoomStage
          roomData={roomData}
          bothOnline={bothOnline}
          currentPlayerRole={session.playerRole}
          onPetTap={handlePetTap}
          onCoopPlayBall={handleCoopPlayBall}
          onCleanTrash={handleCleanSingleTrash}
          onOpenStickyNote={() => setActiveModal('sticky')}
          onOpenPhotoFrame={() => setActiveModal('photo')}
          onOpenGift={() => setActiveModal('gift')}
        />

        {/* Khay trượt nhanh: Cho Ăn hoặc Chăm Sóc */}
        {activeTray === 'feed' && (
          <div className="absolute inset-x-2 bottom-2 z-40 bg-white/95 backdrop-blur-md rounded-3xl p-3 border-2 border-orange-300 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-950">
                🍽️ Chọn món ngon cho {pet.name || 'Mochi'} (Đổi người chăm = Combo x2 Xu)
              </span>
              <button
                type="button"
                onClick={() => setActiveTray(null)}
                className="text-xs font-bold text-amber-700"
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
                  className="p-2 rounded-2xl bg-amber-50 hover:bg-orange-50 border border-amber-200 flex flex-col items-center text-center active:scale-95 transition-transform"
                >
                  <span className="text-2xl">{food.icon}</span>
                  <span className="text-[11px] font-black text-amber-950 mt-1 leading-tight">
                    {food.name}
                  </span>
                  <span className="text-[10px] font-extrabold text-orange-600 mt-0.5">
                    {food.price === 0 ? 'Miễn phí' : `${food.price} Xu`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTray === 'care' && (
          <div className="absolute inset-x-2 bottom-2 z-40 bg-white/95 backdrop-blur-md rounded-3xl p-3 border-2 border-emerald-300 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-950">
                🛁 Chăm sóc & Dọn dẹp Nhà Chung
              </span>
              <button
                type="button"
                onClick={() => setActiveTray(null)}
                className="text-xs font-bold text-amber-700"
              >
                Đóng
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCareAction('bath')}
                className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col items-center active:scale-95"
              >
                <Bath className="w-5 h-5 text-sky-600 mb-1" />
                <span className="text-xs font-black text-amber-950">Tắm Thơm</span>
                <span className="text-[10px] font-bold text-sky-700">Sạch 100%</span>
              </button>

              <button
                type="button"
                onClick={() => handleCareAction('clean_all')}
                className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-black text-amber-950">Dọn Phòng</span>
                <span className="text-[10px] font-bold text-emerald-700">Quét sạch bụi</span>
              </button>

              <button
                type="button"
                onClick={() => handleCareAction('toggle_sleep')}
                className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col items-center active:scale-95"
              >
                {pet.isSleeping ? (
                  <Sun className="w-5 h-5 text-amber-500 mb-1" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600 mb-1" />
                )}
                <span className="text-xs font-black text-amber-950">
                  {pet.isSleeping ? 'Bật Đèn Dậy' : 'Tắt Đèn Ngủ'}
                </span>
                <span className="text-[10px] font-bold text-indigo-700">
                  +15 Năng lượng/h
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. THANH 4 CHỈ SỐ MINI NGAY DƯỚI PHÒNG */}
      <section className="grid grid-cols-4 gap-2 mb-2 shrink-0">
        {statItems.map((st) => {
          const IconComp = st.icon;
          return (
            <div
              key={st.id}
              className="bg-white/90 rounded-2xl px-2.5 py-1.5 border border-orange-200/80 shadow-sm"
            >
              <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-950 mb-1">
                <span className="flex items-center gap-1">
                  <IconComp className="w-3 h-3 text-orange-500" />
                  {st.label}
                </span>
                <span>{st.value}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${st.barColor}`}
                  style={{ width: `${st.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. BOTTOM ACTION DOCK (5 NÚT THAO TÁC LỚN DỄ BẤM BẰNG NGÓN CÁI) */}
      <nav className="bg-white/95 backdrop-blur-md rounded-3xl p-1.5 border-2 border-orange-200 shadow-lg grid grid-cols-5 gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTray(activeTray === 'feed' ? null : 'feed')}
          className={`py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all ${
            activeTray === 'feed'
              ? 'bg-orange-400 text-white shadow-sm'
              : 'text-amber-950 hover:bg-orange-50'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[11px] font-extrabold">Cho ăn</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTray(activeTray === 'care' ? null : 'care')}
          className={`py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all ${
            activeTray === 'care'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-amber-950 hover:bg-emerald-50'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[11px] font-extrabold">Chăm sóc</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTray(null);
            setActiveModal('chat');
          }}
          className="py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-orange-400 to-rose-400 text-white shadow-md active:scale-95 transition-transform"
        >
          <MessageCircleHeart className="w-5 h-5" />
          <span className="text-[11px] font-black">Trò chuyện</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTray(null);
            setActiveModal('shop');
          }}
          className="py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-amber-950 hover:bg-orange-50 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-5 h-5 text-orange-500" />
          <span className="text-[11px] font-extrabold">Cửa hàng</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTray(null);
            setActiveModal('log');
          }}
          className="py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-amber-950 hover:bg-orange-50 active:scale-95 transition-all"
        >
          <BookOpen className="w-5 h-5 text-orange-500" />
          <span className="text-[11px] font-extrabold">Nhật ký</span>
        </button>
      </nav>

      {/* HỆ THỐNG MODALS */}
      <ShopModal
        isOpen={activeModal === 'shop'}
        onClose={() => setActiveModal(null)}
        roomData={roomData}
        onBuyAndEquip={handleBuyAndEquip}
        onEquipItem={handleEquipExisting}
        onSendMysteryGift={handleSendMysteryGift}
      />

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
        onRenamePet={handleRenamePet}
        onSyncEncryptedKey={handleSyncEncryptedKey}
        onToggleDemoCoopPartner={handleToggleDemoCoopPartner}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
}
