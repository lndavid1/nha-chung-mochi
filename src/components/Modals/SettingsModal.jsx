import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Cpu,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Clock,
  Copy,
  LogOut,
  Users
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

export default function SettingsModal({
  isOpen,
  onClose,
  roomData,
  session,
  onRenamePet,
  onSyncEncryptedKey,
  onToggleDemoCoopPartner,
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-amber-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#FFF9F2] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-orange-200 shadow-2xl max-h-[88dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-between border-b border-orange-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-base font-black text-amber-950">
                Cài Đặt Phòng & Bộ Não AI
              </h2>
              <p className="text-[11px] font-bold text-amber-800">
                Mã phòng: <span className="text-orange-600 font-black">{session?.roomId}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/80 text-amber-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scroll space-y-4 flex-1">
          {/* 1. Thông tin phòng & Đổi tên thú cưng */}
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950">
                🏠 Phòng: {session?.roomId} ({session?.playerName})
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-700 text-[11px] font-extrabold flex items-center gap-1 active:scale-95"
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
                className="flex-1 px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-bold text-amber-950"
              />
              <button
                type="button"
                onClick={() => onRenamePet(petNameInput.trim() || 'Mochi')}
                className="px-3 py-1.5 rounded-xl bg-amber-900 text-white text-xs font-extrabold active:scale-95"
              >
                Đổi tên bé
              </button>
            </div>

            {/* Nút giả lập người thứ 2 cùng online để test nhanh hiệu ứng Co-op */}
            <div className="pt-1 border-t border-amber-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800">
                Chế độ: {mode === 'firebase' ? 'Firebase Cloud' : 'Local Co-op'}
              </span>
              <button
                type="button"
                onClick={onToggleDemoCoopPartner}
                className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1 active:scale-95"
              >
                <Users className="w-3 h-3" />
                <span>Bật/Tắt Co-op 2 người Online</span>
              </button>
            </div>
          </div>

          {/* 2. Cấu hình Gemini API Key (Không hardcode) */}
          <form
            onSubmit={handleSaveApiKey}
            className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
              <KeyRound className="w-4 h-4 text-orange-500" />
              <span>Gemini API Key (Google AI Studio Free Tier)</span>
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Dán AIzaSy... vào đây (Chỉ lưu cục bộ)"
              className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-xs font-mono text-amber-950"
            />
            <label className="flex items-center gap-2 text-[11px] font-bold text-amber-800 cursor-pointer">
              <input
                type="checkbox"
                checked={syncKeyToRoom}
                onChange={(e) => setSyncKeyToRoom(e.target.checked)}
                className="rounded text-orange-500"
              />
              <span>Đồng bộ mã hóa nhẹ vào phòng để người thứ 2 không cần nhập lại</span>
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-orange-400 text-white text-xs font-black shadow-sm active:scale-95"
              >
                Lưu API Key
              </button>
              <button
                type="button"
                disabled={testingAi}
                onClick={handleTestAiConnection}
                className="flex-1 py-2 rounded-xl bg-amber-900 text-white text-xs font-black shadow-sm active:scale-95"
              >
                {testingAi ? 'Đang thử...' : 'Kiểm tra kết nối AI'}
              </button>
            </div>
          </form>

          {testResult && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold border ${
                testResult.ok
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {testResult.text}
            </div>
          )}

          {/* 3. Trạng thái Chuỗi 6 Model Dự Phòng + Offline Brain */}
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                <Cpu className="w-4 h-4 text-orange-500" />
                <span>Trạng Thái Chuỗi Model Dự Phòng</span>
              </div>
              <button
                type="button"
                onClick={handleResetCooldown}
                className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-[11px] font-extrabold flex items-center gap-1 active:scale-95"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Cooldown</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {report.models.map((m, idx) => (
                <div
                  key={m.id}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs ${
                    m.isLastUsed
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-amber-50/40 border-amber-200/60'
                  }`}
                >
                  <div>
                    <div className="font-black text-amber-950 flex items-center gap-1.5">
                      <span>
                        {idx + 1}. {m.id}
                      </span>
                      {m.isLastUsed && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-400 text-white text-[9px] font-black">
                          Vừa dùng
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-semibold text-amber-800">
                      {m.tier}
                    </div>
                  </div>

                  {m.status === 'ready' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      <CheckCircle2 className="w-3 h-3" />
                      Sẵn sàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                      <Clock className="w-3 h-3" />
                      Nghỉ {m.remainingMinutes}p
                    </span>
                  )}
                </div>
              ))}

              {/* Dự phòng cuối cùng: Local Offline Brain */}
              <div
                className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs ${
                  report.offlineBrainActive
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-amber-50/40 border-amber-200/60'
                }`}
              >
                <div>
                  <div className="font-black text-amber-950 flex items-center gap-1.5">
                    <span>7. Local Offline Brain (35+ câu thoại Việt)</span>
                    {report.offlineBrainActive && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-400 text-white text-[9px] font-black">
                        Đang trực
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-semibold text-amber-800">
                    Dự phòng cuối • Không bao giờ lỗi/crash
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  Luôn bật
                </span>
              </div>
            </div>
          </div>

          {/* 4. Đổi phòng / Đăng xuất khỏi phòng hiện tại */}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="w-full py-2.5 rounded-2xl bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Rời Phòng / Chuyển Sang Mã Phòng Khác</span>
          </button>
        </div>
      </div>
    </div>
  );
}
