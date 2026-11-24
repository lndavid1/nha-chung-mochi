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
  Moon
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
import BottomSheet from '../BottomSheet';

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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [syncKeyToRoom, setSyncKeyToRoom] = useState(false);
  const [report, setReport] = useState(() => getModelsStatusReport());
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

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
    }
  }, [isOpen, roomData, session]);

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
