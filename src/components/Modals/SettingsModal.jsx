import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Clock,
  Copy,
  LogOut,
  Users,
  Sun,
  Sunset,
  Moon,
  Bell,
  BellOff,
  Share,
  ChevronDown,
  ChevronUp,
  Send,
  Server,
  Music,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  getSavedGeminiKey,
  setSavedGeminiKey,
  getModelsStatusReport,
  resetAllModelCooldowns,
  askPetBrain
} from '../../services/petBrain';
import {
  encodeSharedApiKey,
  decodeSharedApiKey,
  getConnectionMode
} from '../../services/firebase';
import {
  getPushEnvironment,
  getPushConfig,
  savePushConfigToLocal,
  syncPublicPushConfigToRoom,
  checkPushWorkerHealth,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentDeviceSubscription,
  sendTestPushToSelf
} from '../../services/pushService';
import BottomSheet from '../BottomSheet';
import { soundEngine, useSoundSettings } from '../../services/soundEngine';

export default function SettingsModal({
  isOpen,
  onClose,
  roomData,
  session,
  timeOverride = 'auto',
  onChangeTimeOverride,
  onRenamePet,
  onSyncEncryptedKey,
  onToggleDemoCoopPartner,
  onOpenDevCalibrator,
  onLeaveRoom
}) {
  const [petNameInput, setPetNameInput] = useState('');
  const snd = useSoundSettings();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [syncKeyToRoom, setSyncKeyToRoom] = useState(false);
  const [report, setReport] = useState(() => getModelsStatusReport());
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Web Push state
  const [pushEnv, setPushEnv] = useState(() => getPushEnvironment());
  const [hasDeviceSub, setHasDeviceSub] = useState(false);
  const [pushBusy, setPushBusy] = useState(null); // 'subscribe' | 'unsubscribe' | 'test' | 'health' | 'save' | null
  const [pushNotice, setPushNotice] = useState(null);
  const [showWorkerConfig, setShowWorkerConfig] = useState(false);
  const [workerUrlInput, setWorkerUrlInput] = useState('');
  const [vapidPublicKeyInput, setVapidPublicKeyInput] = useState('');
  const [pushSecretInput, setPushSecretInput] = useState('');
  const [syncPublicPushToRoom, setSyncPublicPushToRoom] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setPetNameInput(roomData?.pet?.name || 'Mochi');
      const localKey = getSavedGeminiKey();
      const sharedDecoded = roomData?.encryptedGeminiKey
        ? decodeSharedApiKey(roomData.encryptedGeminiKey, session?.roomId)
        : '';
      setApiKeyInput(localKey || sharedDecoded || '');
      setSyncKeyToRoom(Boolean(roomData?.encryptedGeminiKey));
      setReport(getModelsStatusReport());
      setTestResult(null);

      // Load Web Push environment & config
      setPushEnv(getPushEnvironment());
      const pushCfg = getPushConfig(roomData?.pushConfig);
      setWorkerUrlInput(pushCfg.workerUrl);
      setVapidPublicKeyInput(pushCfg.vapidPublicKey);
      setPushSecretInput(pushCfg.pushSecret);
      setSyncPublicPushToRoom(true);
      setPushNotice(null);

      getCurrentDeviceSubscription().then((sub) => {
        setHasDeviceSub(Boolean(sub));
      });
    }
  }, [isOpen, roomData, session]);

  const myRole = session?.playerRole || 'player1';
  const partnerRole = myRole === 'player1' ? 'player2' : 'player1';
  const myRoomSub = roomData?.pushSubscriptions?.[myRole] || null;
  const partnerRoomSub = roomData?.pushSubscriptions?.[partnerRole] || null;
  const isPushActiveOnThisDevice = Boolean(hasDeviceSub && myRoomSub?.endpoint);

  const handleSavePushConfig = async (e) => {
    e.preventDefault();
    setPushBusy('save');
    setPushNotice(null);
    try {
      const saved = savePushConfigToLocal({
        workerUrl: workerUrlInput,
        vapidPublicKey: vapidPublicKeyInput,
        pushSecret: pushSecretInput
      });
      if (syncPublicPushToRoom && session?.roomId && (saved.workerUrl || saved.vapidPublicKey)) {
        await syncPublicPushConfigToRoom(session.roomId, {
          workerUrl: saved.workerUrl,
          vapidPublicKey: saved.vapidPublicKey
        });
      }
      setPushNotice({
        ok: true,
        text: syncPublicPushToRoom
          ? 'Đã lưu cấu hình Worker (chỉ đồng bộ URL & Public Key công khai lên phòng).'
          : 'Đã lưu cấu hình Worker cục bộ trên thiết bị này!'
      });
    } catch (err) {
      setPushNotice({ ok: false, text: err.message || 'Không lưu được cấu hình Push.' });
    } finally {
      setPushBusy(null);
    }
  };

  const handleCheckWorkerHealth = async () => {
    setPushBusy('health');
    setPushNotice(null);
    try {
      const data = await checkPushWorkerHealth(workerUrlInput);
      setPushNotice({
        ok: true,
        text: `Worker hoạt động tốt! (${data.service || 'mochi-push-worker'})`
      });
    } catch (err) {
      setPushNotice({
        ok: false,
        text: `Không kết nối được Worker: ${err.message || 'Lỗi mạng'}`
      });
    } finally {
      setPushBusy(null);
    }
  };

  const handleEnablePush = async () => {
    setPushBusy('subscribe');
    setPushNotice(null);
    try {
      // Lưu trước mọi thay đổi đang gõ dở trong accordion
      if (workerUrlInput || vapidPublicKeyInput || pushSecretInput) {
        savePushConfigToLocal({
          workerUrl: workerUrlInput,
          vapidPublicKey: vapidPublicKeyInput,
          pushSecret: pushSecretInput
        });
      }
      const sub = await subscribeToPush(session?.roomId, myRole, roomData?.pushConfig);
      setHasDeviceSub(true);
      setPushEnv(getPushEnvironment());
      setPushNotice({
        ok: true,
        text: `Đã bật thông báo màn hình khóa trên ${sub.device}!`
      });
    } catch (err) {
      if (String(err.message || '').includes('VAPID Public Key')) {
        setShowWorkerConfig(true);
      }
      setPushNotice({ ok: false, text: err.message || 'Không thể bật thông báo.' });
    } finally {
      setPushBusy(null);
    }
  };

  const handleDisablePush = async () => {
    setPushBusy('unsubscribe');
    setPushNotice(null);
    try {
      await unsubscribeFromPush(session?.roomId, myRole);
      setHasDeviceSub(false);
      setPushNotice({ ok: true, text: 'Đã tắt thông báo màn hình khóa trên máy này.' });
    } catch (err) {
      setPushNotice({ ok: false, text: err.message || 'Lỗi khi tắt thông báo.' });
    } finally {
      setPushBusy(null);
    }
  };

  const handleSendTestPush = async () => {
    setPushBusy('test');
    setPushNotice(null);
    try {
      await sendTestPushToSelf(session?.roomId, myRole, roomData);
      setPushNotice({
        ok: true,
        text: 'Đã gửi thông báo thử! Hãy khóa màn hình hoặc xem thanh thông báo.'
      });
    } catch (err) {
      setPushNotice({ ok: false, text: err.message || 'Gửi thông báo thử thất bại.' });
    } finally {
      setPushBusy(null);
    }
  };

  const refreshReport = () => {
    setReport(getModelsStatusReport());
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setSavedGeminiKey(apiKeyInput);
    if (syncKeyToRoom && apiKeyInput.trim()) {
      const encoded = encodeSharedApiKey(apiKeyInput.trim(), session?.roomId);
      onSyncEncryptedKey(encoded);
    } else if (!syncKeyToRoom) {
      onSyncEncryptedKey('');
    }
    setTestResult({
      ok: true,
      text: 'Đã lưu Gemini API Key vào thiết bị!'
    });
    refreshReport();
  };

  const handleTestAiConnection = async () => {
    setSavedGeminiKey(apiKeyInput);
    setTestingAi(true);
    setTestResult(null);
    try {
      const res = await askPetBrain({
        roomData,
        actorName: session?.playerName || 'Chủ nhỏ',
        triggerType: 'test',
        actionDetail: 'Kiểm tra kết nối bộ não AI',
        bothOnline: true
      });
      refreshReport();
      setTestResult({
        ok: true,
        text: `[${res.modelUsed}] "${res.dialogue}"`
      });
    } catch (err) {
      setTestResult({
        ok: false,
        text: err.message || 'Lỗi thử nghiệm AI'
      });
    } finally {
      setTestingAi(false);
    }
  };

  const handleResetCooldown = () => {
    resetAllModelCooldowns();
    refreshReport();
    setTestResult({
      ok: true,
      text: 'Đã xóa toàn bộ thời gian nghỉ (Cooldown) của 6 model AI!'
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(
      session?.roomId || ''
    )}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const mode = getConnectionMode();

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Cài Đặt Phòng & Bộ Não AI"
      subtitle={`Mã phòng: ${session?.roomId} • ${
        mode === 'firebase' ? 'Firebase Cloud' : 'Local Co-op'
      }`}
      icon={Settings}
      maxHeight="88dvh"
    >
      <div className="space-y-4">
        {/* 1. Chế độ Xem thử Ánh Sáng Ngày / Hoàng Hôn / Đêm */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-2">
          <span className="text-xs font-black text-[#4A3525] block">
            Ánh Sáng & Thời Gian Trong Phòng
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'auto', label: 'Tự động', icon: Clock },
              { id: 'day', label: 'Ban ngày', icon: Sun },
              { id: 'sunset', label: 'Hoàng hôn', icon: Sunset },
              { id: 'night', label: 'Đêm ấm', icon: Moon }
            ].map((t) => {
              const IconComp = t.icon;
              const active = timeOverride === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    onChangeTimeOverride && onChangeTimeOverride(t.id)
                  }
                  className={`py-2 px-1.5 rounded-xl border-[1.8px] border-[#4A3525] text-[10.5px] font-black flex flex-col items-center gap-1 transition-all ${
                    active
                      ? 'bg-[#FFE082] text-[#4A3525] shadow-sm'
                      : 'bg-[#FFF8F0] text-[#7D6352]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Thông tin phòng & Đổi tên thú cưng */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#4A3525]">
              Phòng: {session?.roomId} ({session?.playerName})
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-xl bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black flex items-center gap-1 active:scale-95"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedInvite ? 'Đã copy link!' : 'Copy link mời'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={16}
              value={petNameInput}
              onChange={(e) => setPetNameInput(e.target.value)}
              placeholder="Đổi tên thú cưng..."
              className="flex-1 px-3 py-1.5 rounded-xl border-[1.8px] border-[#4A3525] bg-[#FFF8F0] text-xs font-extrabold text-[#4A3525]"
            />
            <button
              type="button"
              onClick={() => onRenamePet(petNameInput.trim() || 'Mochi')}
              className="tactile-btn px-3 py-1.5 rounded-xl bg-[#FF9B71] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black"
            >
              Đổi tên bé
            </button>
          </div>

          <div className="pt-2 border-t border-[#4A3525]/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7D6352]">
              Thử nghiệm hiệu ứng 2 người cùng ở nhà:
            </span>
            <button
              type="button"
              onClick={onToggleDemoCoopPartner}
              className="px-2.5 py-1 rounded-xl bg-[#88C9A1] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black flex items-center gap-1 active:scale-95"
            >
              <Users className="w-3 h-3" />
              <span>Bật/Tắt Co-op Online</span>
            </button>
          </div>
        </div>

        {/* 2.5 Thông Báo Màn Hình Khóa (iOS PWA / Android / PC) */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#4A3525]">
              <Bell className="w-4 h-4 text-[#E87A4D]" />
              <span>Thông Báo Màn Hình Khóa</span>
            </div>
            {isPushActiveOnThisDevice ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#88C9A1]/45 border border-[#4A3525] text-[#4A3525] text-[10px] font-black">
                <CheckCircle2 className="w-3 h-3" />
                Đã bật ({myRoomSub?.device || 'Máy này'})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF0DE] border border-[#4A3525] text-[#7D6352] text-[10px] font-black">
                Chưa bật
              </span>
            )}
          </div>

          <div className="text-[10.5px] font-bold text-[#7D6352] flex items-center justify-between">
            <span>Nhận báo khi có giấy nhớ, hộp quà, phá kỷ lục & gọi về nhà.</span>
          </div>

          {partnerRoomSub?.endpoint && (
            <div className="text-[10.5px] font-extrabold text-[#5EA87A]">
              • Người kia đã bật thông báo ({partnerRoomSub.device || 'Thiết bị'})
            </div>
          )}

          {pushEnv.isIOS && !pushEnv.isStandalone ? (
            <div className="p-3 rounded-xl bg-[#FFF3D6] border-[1.6px] border-[#4A3525] space-y-1.5 text-[11px] font-bold text-[#4A3525]">
              <div className="font-black flex items-center gap-1.5 text-[#E87A4D]">
                <Share className="w-3.5 h-3.5" />
                <span>Hướng dẫn bật thông báo trên iPhone (iOS 16.4+)</span>
              </div>
              <p>
                <strong>Bước 1:</strong> Bấm nút <strong>Chia sẻ (Share)</strong> ở thanh đáy Safari.
              </p>
              <p>
                <strong>Bước 2:</strong> Chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>,
                sau đó mở lại game từ biểu tượng ngoài màn hình chính để bật thông báo!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {!isPushActiveOnThisDevice ? (
                <button
                  type="button"
                  disabled={Boolean(pushBusy)}
                  onClick={handleEnablePush}
                  className="tactile-btn w-full py-2.5 rounded-xl bg-[#FF9B71] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    {pushBusy === 'subscribe'
                      ? 'Đang đăng ký...'
                      : 'Bật thông báo màn hình khóa'}
                  </span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={Boolean(pushBusy)}
                    onClick={handleSendTestPush}
                    className="tactile-btn w-full py-2 rounded-xl bg-[#FFE082] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {pushBusy === 'test'
                        ? 'Đang gửi thử...'
                        : 'Gửi thử thông báo cho chính mình'}
                    </span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={Boolean(pushBusy)}
                      onClick={handleEnablePush}
                      className="tactile-btn flex-1 py-1.5 rounded-xl bg-[#FFF0DE] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Đăng ký lại</span>
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(pushBusy)}
                      onClick={handleDisablePush}
                      className="tactile-btn flex-1 py-1.5 rounded-xl bg-[#FFB7C5] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black flex items-center justify-center gap-1"
                    >
                      <BellOff className="w-3 h-3" />
                      <span>
                        {pushBusy === 'unsubscribe' ? 'Đang tắt...' : 'Tắt thông báo'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {pushNotice && (
            <div
              className={`p-2.5 rounded-xl text-[11px] font-extrabold border-[1.6px] border-[#4A3525] ${
                pushNotice.ok ? 'bg-[#88C9A1]/40 text-[#4A3525]' : 'bg-[#FFB7C5] text-[#4A3525]'
              }`}
            >
              {pushNotice.text}
            </div>
          )}

          {/* Accordion Cài đặt Cloudflare Worker */}
          <div className="pt-1.5 border-t border-[#4A3525]/10">
            <button
              type="button"
              onClick={() => setShowWorkerConfig((prev) => !prev)}
              className="w-full flex items-center justify-between text-[11px] font-black text-[#4A3525] py-1"
            >
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#7D6352]" />
                <span>Cài đặt Cloudflare Worker (0 đồng)</span>
              </span>
              {showWorkerConfig ? (
                <ChevronUp className="w-4 h-4 text-[#7D6352]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#7D6352]" />
              )}
            </button>

            {showWorkerConfig && (
              <form onSubmit={handleSavePushConfig} className="mt-2 space-y-2">
                <div>
                  <label className="block text-[10px] font-black text-[#7D6352] mb-0.5">
                    Cloudflare Worker URL
                  </label>
                  <input
                    type="url"
                    value={workerUrlInput}
                    onChange={(e) => setWorkerUrlInput(e.target.value)}
                    placeholder="https://mochi-push-worker.tenban.workers.dev"
                    className="w-full px-2.5 py-1.5 rounded-xl border-[1.6px] border-[#4A3525] bg-[#FFF8F0] text-[11px] font-mono text-[#4A3525]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#7D6352] mb-0.5">
                    VAPID Public Key (Khóa công khai)
                  </label>
                  <input
                    type="text"
                    value={vapidPublicKeyInput}
                    onChange={(e) => setVapidPublicKeyInput(e.target.value)}
                    placeholder="Dán VAPID Public Key (B...)"
                    className="w-full px-2.5 py-1.5 rounded-xl border-[1.6px] border-[#4A3525] bg-[#FFF8F0] text-[11px] font-mono text-[#4A3525]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#7D6352] mb-0.5">
                    Push Secret (Tùy chọn • Chỉ lưu cục bộ trên máy này)
                  </label>
                  <input
                    type="password"
                    value={pushSecretInput}
                    onChange={(e) => setPushSecretInput(e.target.value)}
                    placeholder="Khớp với PUSH_SHARED_SECRET trên Worker"
                    className="w-full px-2.5 py-1.5 rounded-xl border-[1.6px] border-[#4A3525] bg-[#FFF8F0] text-[11px] font-mono text-[#4A3525]"
                  />
                </div>

                <label className="flex items-start gap-2 text-[10.5px] font-bold text-[#7D6352] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncPublicPushToRoom}
                    onChange={(e) => setSyncPublicPushToRoom(e.target.checked)}
                    className="mt-0.5 rounded text-[#FF9B71]"
                  />
                  <span>
                    Đồng bộ Worker URL &amp; VAPID Public Key lên phòng (không bao giờ đồng bộ khóa bí mật)
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={Boolean(pushBusy)}
                    className="tactile-btn flex-1 py-1.5 rounded-xl bg-[#88C9A1] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black"
                  >
                    {pushBusy === 'save' ? 'Đang lưu...' : 'Lưu cấu hình Push'}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(pushBusy)}
                    onClick={handleCheckWorkerHealth}
                    className="tactile-btn flex-1 py-1.5 rounded-xl bg-[#FFF0DE] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black"
                  >
                    {pushBusy === 'health' ? 'Đang kiểm tra...' : 'Kiểm tra Worker'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 2.8 Âm Thanh & Nhạc Nền */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#4A3525]">
              <Music className="w-4 h-4 text-[#E87A4D]" />
              <span>Âm Thanh &amp; Nhạc Nền</span>
            </div>
            <button
              type="button"
              onClick={() => soundEngine.setSettings({ muted: !snd.muted })}
              className={`px-2.5 py-1 rounded-xl border-[1.6px] border-[#4A3525] text-[11px] font-black flex items-center gap-1 active:scale-95 ${
                snd.muted ? 'bg-[#FFB7C5]' : 'bg-[#88C9A1]'
              }`}
            >
              {snd.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{snd.muted ? 'Đang tắt tiếng' : 'Đang bật'}</span>
            </button>
          </div>

          {[
            { key: 'bgm', label: 'Nhạc nền (BGM)', en: snd.bgmEnabled, vol: snd.bgmVolume },
            { key: 'sfx', label: 'Hiệu ứng (SFX)', en: snd.sfxEnabled, vol: snd.sfxVolume }
          ].map((ch) => (
            <div key={ch.key} className="space-y-1">
              <label className="flex items-center justify-between text-[11px] font-black text-[#4A3525] cursor-pointer">
                <span>{ch.label}</span>
                <input
                  type="checkbox"
                  checked={ch.en}
                  onChange={(e) => {
                    soundEngine.setSettings({ [`${ch.key}Enabled`]: e.target.checked });
                    if (ch.key === 'sfx' && e.target.checked) {
                      setTimeout(() => soundEngine.play('coin'), 30);
                    }
                  }}
                  className="rounded text-[#FF9B71] w-4 h-4"
                />
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ch.vol}
                disabled={!ch.en}
                onChange={(e) =>
                  soundEngine.setSettings({ [`${ch.key}Volume`]: Number(e.target.value) })
                }
                onPointerUp={() => ch.key === 'sfx' && soundEngine.play('tap')}
                className="w-full accent-[#FF9B71] disabled:opacity-40"
              />
            </div>
          ))}

          <div className="space-y-1">
            <span className="text-[11px] font-black text-[#4A3525]">Chế độ nhạc nền</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'auto', label: 'Tự động (Ngày/Đêm/Game)' },
                { id: 'day', label: 'Luôn Lofi Ban Ngày' },
                { id: 'night', label: 'Luôn Hộp Nhạc Ru Ngủ' },
                { id: 'off', label: 'Tắt nhạc nền' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    soundEngine.setSettings({ bgmMode: m.id });
                    soundEngine.play('tap');
                  }}
                  className={`py-1.5 px-1.5 rounded-xl border-[1.6px] border-[#4A3525] text-[10.5px] font-black leading-tight ${
                    snd.bgmMode === m.id ? 'bg-[#FFE082]' : 'bg-[#FFF8F0] text-[#7D6352]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              soundEngine.play('petVoice', { species: roomData?.pet?.type || 'cat' })
            }
            className="tactile-btn w-full py-2 rounded-xl bg-[#FFB7C5] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black"
          >
            Thử tiếng Bé kêu
          </button>
        </div>

        {/* 3. Cấu hình Gemini API Key */}
        <form
          onSubmit={handleSaveApiKey}
          className="p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-2.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-black text-[#4A3525]">
            <KeyRound className="w-4 h-4 text-[#E87A4D]" />
            <span>Gemini API Key (Google AI Studio Free Tier)</span>
          </div>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Dán AIzaSy... vào đây (Lưu cục bộ an toàn)"
            className="w-full px-3 py-2 rounded-xl border-[1.8px] border-[#4A3525] bg-[#FFF8F0] text-xs font-mono text-[#4A3525]"
          />
          <label className="flex items-center gap-2 text-[11px] font-bold text-[#7D6352] cursor-pointer">
            <input
              type="checkbox"
              checked={syncKeyToRoom}
              onChange={(e) => setSyncKeyToRoom(e.target.checked)}
              className="rounded text-[#FF9B71]"
            />
            <span>Đồng bộ mã hóa nhẹ vào phòng để người thứ 2 không cần nhập lại</span>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="tactile-btn flex-1 py-2 rounded-xl bg-[#FF9B71] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black"
            >
              Lưu API Key
            </button>
            <button
              type="button"
              disabled={testingAi}
              onClick={handleTestAiConnection}
              className="tactile-btn flex-1 py-2 rounded-xl bg-[#FFE082] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black"
            >
              {testingAi ? 'Đang thử...' : 'Kiểm tra kết nối AI'}
            </button>
          </div>
        </form>

        {testResult && (
          <div
            className={`p-3 rounded-2xl text-xs font-extrabold border-2 border-[#4A3525] ${
              testResult.ok ? 'bg-[#88C9A1]/40' : 'bg-[#FFB7C5]'
            }`}
          >
            {testResult.text}
          </div>
        )}

        {/* 4. Trạng thái Chuỗi 6 Model Dự Phòng + Offline Brain */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#4A3525]">
              <Cpu className="w-4 h-4 text-[#E87A4D]" />
              <span>Chuỗi 6 Model Tự Động Đổi Tức Thì</span>
            </div>
            <button
              type="button"
              onClick={handleResetCooldown}
              className="px-2.5 py-1 rounded-xl bg-[#FFF0DE] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[11px] font-black flex items-center gap-1 active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Cooldown</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {report.models.map((m, idx) => (
              <div
                key={m.id}
                className={`px-3 py-2 rounded-xl border-[1.6px] border-[#4A3525] flex items-center justify-between text-xs ${
                  m.isLastUsed ? 'bg-[#FFF3D6]' : 'bg-[#FFF8F0]'
                }`}
              >
                <div>
                  <div className="font-black text-[#4A3525] flex items-center gap-1.5">
                    <span>
                      {idx + 1}. {m.id}
                    </span>
                    {m.isLastUsed && (
                      <span className="px-1.5 py-0.2 rounded bg-[#FF9B71] border border-[#4A3525] text-[#4A3525] text-[9px] font-black">
                        Vừa dùng
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-[#7D6352]">
                    {m.tier}
                  </div>
                </div>

                {m.status === 'ready' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#88C9A1]/40 border border-[#4A3525] text-[#4A3525] text-[10px] font-black">
                    <CheckCircle2 className="w-3 h-3" />
                    Sẵn sàng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE082] border border-[#4A3525] text-[#4A3525] text-[10px] font-black tabular-nums">
                    <Clock className="w-3 h-3" />
                    Nghỉ {m.remainingMinutes}p
                  </span>
                )}
              </div>
            ))}

            <div
              className={`px-3 py-2 rounded-xl border-[1.6px] border-[#4A3525] flex items-center justify-between text-xs ${
                report.offlineBrainActive ? 'bg-[#FFF3D6]' : 'bg-[#FFF8F0]'
              }`}
            >
              <div>
                <div className="font-black text-[#4A3525]">
                  7. Local Offline Brain (35+ câu thoại Việt)
                </div>
                <div className="text-[10px] font-bold text-[#7D6352]">
                  Dự phòng cuối • Không bao giờ lỗi/crash
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#88C9A1]/40 border border-[#4A3525] text-[#4A3525] text-[10px] font-black">
                Luôn trực
              </span>
            </div>
          </div>
        </div>

        {/* 5. Công cụ ẩn Căn chỉnh phụ kiện (Dev Calibrator) & Rời phòng */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenDevCalibrator) onOpenDevCalibrator();
          }}
          className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
        >
          <span>Căn chỉnh phụ kiện trực quan (Dev)</span>
        </button>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FFB7C5] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Rời Phòng / Chuyển Sang Mã Phòng Khác</span>
        </button>
      </div>
    </BottomSheet>
  );
}
