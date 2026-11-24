import React, { useState, useEffect } from 'react';
import { Home, Users, Database, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { PET_TYPES, generateRoomCode, createInitialRoomState } from '../utils/gameLogic';
import {
  createRoomInDB,
  joinRoomInDB,
  getResolvedFirebaseConfig,
  saveFirebaseConfigToLocal,
  getConnectionMode
} from '../services/firebase';

export default function Onboarding({ onEnterRoom }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join' | 'firebase'
  const [roomCode, setRoomCode] = useState(() => generateRoomCode());
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [petName, setPetName] = useState('Mochi');
  const [petType, setPetType] = useState('cat');
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Firebase config form
  const resolvedFb = getResolvedFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(resolvedFb.config?.apiKey || '');
  const [fbDbUrl, setFbDbUrl] = useState(resolvedFb.config?.databaseURL || '');
  const [fbProjectId, setFbProjectId] = useState(resolvedFb.config?.projectId || '');
  const [fbSavedToast, setFbSavedToast] = useState('');

  // Tự động điền mã phòng nếu mở từ link ?room=MOCHI-88
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setJoinCode(roomParam.trim().toUpperCase());
      setActiveTab('join');
    }
  }, []);

  const handleSelectPetType = (typeObj) => {
    setPetType(typeObj.id);
    if (!petName || PET_TYPES.some((p) => p.defaultName === petName)) {
      setPetName(typeObj.defaultName);
    }
  };

  const handleCopyInviteLink = () => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const inviteUrl = `${baseUrl}?room=${encodeURIComponent(roomCode)}`;
    navigator.clipboard.writeText(inviteUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!playerName.trim()) {
      setErrorMsg('Hãy nhập tên dễ thương của bạn trước nha!');
      return;
    }
    setLoading(true);
    try {
      const cleanCode = roomCode.trim().toUpperCase();
      const initialData = createInitialRoomState({
        roomId: cleanCode,
        player1Name: playerName.trim(),
        petName: petName.trim() || 'Mochi',
        petType
      });
      await createRoomInDB(cleanCode, initialData);
      onEnterRoom({
        roomId: cleanCode,
        playerRole: 'player1',
        playerName: playerName.trim()
      });
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tạo phòng, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!joinCode.trim()) {
      setErrorMsg('Hãy nhập mã phòng 6 ký tự của hai bạn nha!');
      return;
    }
    if (!playerName.trim()) {
      setErrorMsg('Hãy nhập tên của bạn để người kia nhận ra nhé!');
      return;
    }
    setLoading(true);
    try {
      const cleanCode = joinCode.trim().toUpperCase();
      const { role } = await joinRoomInDB(cleanCode, playerName.trim());
      onEnterRoom({
        roomId: cleanCode,
        playerRole: role,
        playerName: playerName.trim()
      });
    } catch (err) {
      setErrorMsg(err.message || 'Không thể vào phòng, hãy kiểm tra lại mã phòng!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (!fbApiKey.trim() || !fbDbUrl.trim()) {
      saveFirebaseConfigToLocal(null);
      setFbSavedToast('Đã chuyển về chế độ Chơi thử nghiệm trên thiết bị (Local Demo)!');
      setTimeout(() => setFbSavedToast(''), 3000);
      return;
    }
    saveFirebaseConfigToLocal({
      apiKey: fbApiKey.trim(),
      databaseURL: fbDbUrl.trim(),
      projectId: fbProjectId.trim()
    });
    setFbSavedToast('Đã lưu cấu hình Firebase Realtime Database thành công!');
    setTimeout(() => setFbSavedToast(''), 3000);
  };

  const mode = getConnectionMode();

  return (
    <div className="app-shell w-full max-w-md mx-auto flex flex-col justify-between px-4 py-3 overflow-y-auto custom-scroll">
      {/* Header thương hiệu */}
      <div className="text-center pt-1 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold mb-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Co-op Pet & Shared Room cho 2 người</span>
        </div>
        <h1 className="text-2xl font-black text-amber-950 tracking-tight">
          🐾 Nhà Chung Mochi
        </h1>
        <p className="text-xs font-semibold text-amber-800/80 mt-0.5">
          Cùng nuôi thú cưng, trang trí căn phòng ấm cúng & nhắn gửi yêu thương
        </p>
      </div>

      {/* Khung thẻ chính */}
      <div className="bg-white/95 backdrop-blur rounded-3xl p-4 shadow-xl border-2 border-orange-200/80 my-auto">
        {/* Tabs chuyển đổi */}
        <div className="grid grid-cols-3 gap-1.5 bg-amber-50/90 p-1.5 rounded-2xl mb-4 border border-amber-200/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'create'
                ? 'bg-orange-400 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Tạo Nhà Mới</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('join');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'join'
                ? 'bg-orange-400 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Vào Nhà Chung</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('firebase');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'firebase'
                ? 'bg-orange-400 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cloud DB</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 px-3 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* TAB 1: TẠO NHÀ MỚI */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-3">
            {/* Mã phòng & nút copy link mời */}
            <div className="bg-amber-50/90 rounded-2xl p-3 border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-800 block">
                  Mã Phòng Nhà Chung:
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-black text-orange-600 tracking-wider">
                    {roomCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoomCode(generateRoomCode())}
                    className="text-[11px] font-bold text-amber-700 underline"
                  >
                    Đổi mã
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-extrabold shadow-sm active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-orange-500" />
                    <span>Copy link mời</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-extrabold text-amber-900 mb-1">
                  Tên của bạn (Chủ 1)
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="VD: Minh Anh"
                  className="w-full px-3 py-2 rounded-xl border-2 border-amber-200 bg-amber-50/40 text-sm font-bold text-amber-950 focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-amber-900 mb-1">
                  Đặt tên thú cưng
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="VD: Mochi"
                  className="w-full px-3 py-2 rounded-xl border-2 border-amber-200 bg-amber-50/40 text-sm font-bold text-amber-950 focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Chọn loại thú cưng */}
            <div>
              <label className="block text-xs font-extrabold text-amber-900 mb-1.5">
                Chọn bé thú cưng nuôi chung:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PET_TYPES.map((pt) => {
                  const selected = petType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => handleSelectPetType(pt)}
                      className={`p-2.5 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                        selected
                          ? 'border-orange-400 bg-orange-50/90 shadow-sm'
                          : 'border-amber-200/70 bg-white hover:bg-amber-50/40'
                      }`}
                    >
                      <div className="text-xs font-black text-amber-950">
                        {pt.name}
                      </div>
                      <div className="text-[10px] font-bold text-orange-600 mt-0.5">
                        {pt.badge}
                      </div>
                      <p className="text-[10px] text-amber-800/80 mt-1 line-clamp-2 leading-tight">
                        {pt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 text-white font-black text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Đang dựng nhà...' : 'Khai Trương Nhà Chung Ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: VÀO NHÀ CHUNG */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-amber-900 mb-1">
                Nhập mã phòng người kia gửi cho bạn:
              </label>
              <input
                type="text"
                maxLength={14}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="VD: MOCHI-88"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-amber-300 bg-amber-50/50 text-base font-black tracking-wider text-orange-600 uppercase focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-amber-900 mb-1">
                Tên của bạn (Chủ 2 hoặc tên cũ để vào lại):
              </label>
              <input
                type="text"
                maxLength={18}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="VD: Hoàng Nam"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-amber-200 bg-amber-50/40 text-sm font-bold text-amber-950 focus:outline-none focus:border-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Đang kết nối...' : 'Dọn Vào Nhà Chung'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: CẤU HÌNH FIREBASE REALTIME DB */}
        {activeTab === 'firebase' && (
          <form onSubmit={handleSaveFirebaseConfig} className="space-y-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900 leading-relaxed">
              Trạng thái hiện tại:{' '}
              <span className="font-black text-orange-600">
                {mode === 'firebase'
                  ? '🟢 Đang kết nối Firebase Realtime DB (Chơi 2 máy Online)'
                  : '🟡 Chế độ Local Demo (Chơi ngay không cần cài đặt)'}
              </span>
              . Bạn có thể dán Firebase Config miễn phí vào dưới đây để đồng bộ 2 điện thoại ở xa nhau!
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-amber-900 mb-0.5">
                Firebase API Key
              </label>
              <input
                type="text"
                value={fbApiKey}
                onChange={(e) => setFbApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-amber-900 mb-0.5">
                Realtime Database URL (Bắt buộc)
              </label>
              <input
                type="text"
                value={fbDbUrl}
                onChange={(e) => setFbDbUrl(e.target.value)}
                placeholder="https://ten-project-default-rtdb.asia-southeast1.firebasedatabase.app"
                className="w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-amber-900 mb-0.5">
                Project ID (Tùy chọn)
              </label>
              <input
                type="text"
                value={fbProjectId}
                onChange={(e) => setFbProjectId(e.target.value)}
                placeholder="nha-chung-mochi"
                className="w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-mono"
              />
            </div>

            {fbSavedToast && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                ✅ {fbSavedToast}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-amber-900 text-white font-extrabold text-xs shadow active:scale-95"
            >
              Lưu Cấu Hình Kết Nối
            </button>
          </form>
        )}
      </div>

      {/* Footer chỉ dẫn nhanh */}
      <div className="text-center text-[11px] font-bold text-amber-800/75 pb-1">
        💡 Mẹo: Trên iPhone mở bằng Safari → bấm Chia sẻ → Thêm vào MH chính
      </div>
    </div>
  );
}
