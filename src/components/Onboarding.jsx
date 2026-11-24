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
import PetAvatar from './pet/PetAvatar';

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

  const resolvedFb = getResolvedFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(resolvedFb.config?.apiKey || '');
  const [fbDbUrl, setFbDbUrl] = useState(resolvedFb.config?.databaseURL || '');
  const [fbProjectId, setFbProjectId] = useState(resolvedFb.config?.projectId || '');
  const [fbSavedToast, setFbSavedToast] = useState('');

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
      setFbSavedToast('Đã khôi phục kết nối Firebase mặc định!');
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
    <div
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)'
      }}
      className="h-[100dvh] w-full max-w-md mx-auto flex flex-col justify-between px-4 overflow-y-auto custom-scroll bg-[#FFF8F0]"
    >
      {/* Header thương hiệu phong cách Storybook */}
      <div className="text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE082] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black mb-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Co-op Pet & Shared Room cho 2 người</span>
        </div>
        <h1 className="text-2xl font-black text-[#4A3525] tracking-tight">
          Nhà Chung Mochi
        </h1>
        <p className="text-xs font-bold text-[#7D6352] mt-0.5">
          Cùng nuôi thú cưng, trang trí tổ ấm 2.5D & nhắn gửi yêu thương
        </p>
      </div>

      {/* Khung thẻ chính */}
      <div className="bg-[#FFFDF9] rounded-[30px] p-4 shadow-[0_12px_30px_rgba(74,53,37,0.12)] border-[2.5px] border-[#4A3525] my-auto">
        {/* Tabs chuyển đổi */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#FFF0DE] p-1.5 rounded-2xl mb-3.5 border-[1.8px] border-[#4A3525]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'create'
                ? 'bg-[#FF9B71] text-[#4A3525] border-[1.6px] border-[#4A3525] shadow-sm'
                : 'text-[#7D6352]'
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
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'join'
                ? 'bg-[#FF9B71] text-[#4A3525] border-[1.6px] border-[#4A3525] shadow-sm'
                : 'text-[#7D6352]'
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
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'firebase'
                ? 'bg-[#FF9B71] text-[#4A3525] border-[1.6px] border-[#4A3525] shadow-sm'
                : 'text-[#7D6352]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cloud DB</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 px-3 py-2 rounded-2xl bg-[#FFB7C5] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-extrabold">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: TẠO NHÀ MỚI */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-3">
            {/* Sân khấu nhỏ xem trước trực tiếp thú cưng đang chọn */}
            <div className="relative h-28 rounded-2xl bg-[#FFF3E2] border-2 border-[#4A3525] flex items-center justify-between px-4 overflow-hidden">
              <div className="z-10">
                <span className="text-[10.5px] font-extrabold text-[#7D6352] block">
                  Mã Phòng Nhà Chung:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-[#4A3525] tracking-wider tabular-nums">
                    {roomCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoomCode(generateRoomCode())}
                    className="text-[10.5px] font-black text-[#E87A4D] underline"
                  >
                    Đổi mã
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFFDF9] border-[1.6px] border-[#4A3525] text-[#4A3525] text-[10.5px] font-black shadow-sm active:scale-95"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-[#5EA87A]" />
                      <span>Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#E87A4D]" />
                      <span>Copy link mời</span>
                    </>
                  )}
                </button>
              </div>

              <div className="scale-75 -mr-4">
                <PetAvatar
                  type={petType}
                  emotion="happy"
                  accessoryId="acc_sprout"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-black text-[#4A3525] mb-1">
                  Tên của bạn (Chủ 1)
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="VD: Minh Anh"
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3525] bg-[#FFF8F0] text-sm font-extrabold text-[#4A3525] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#4A3525] mb-1">
                  Đặt tên thú cưng
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="VD: Mochi"
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3525] bg-[#FFF8F0] text-sm font-extrabold text-[#4A3525] focus:outline-none"
                />
              </div>
            </div>

            {/* Chọn 3 loài thú cưng */}
            <div>
              <label className="block text-xs font-black text-[#4A3525] mb-1.5">
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
                      className={`p-2.5 rounded-2xl border-2 border-[#4A3525] text-left transition-all active:scale-95 ${
                        selected
                          ? 'bg-[#FFE082] shadow-sm -translate-y-0.5'
                          : 'bg-[#FFF8F0]'
                      }`}
                    >
                      <div className="text-xs font-black text-[#4A3525]">
                        {pt.name}
                      </div>
                      <div className="text-[10px] font-extrabold text-[#E87A4D] mt-0.5">
                        {pt.badge}
                      </div>
                      <p className="text-[9.5px] font-semibold text-[#7D6352] mt-1 line-clamp-2 leading-tight">
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
              className="tactile-btn w-full py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm flex items-center justify-center gap-2"
            >
              <span>
                {loading ? 'Đang dựng tổ ấm...' : 'Khai Trương Nhà Chung Ngay'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: VÀO NHÀ CHUNG */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-[#4A3525] mb-1">
                Nhập mã phòng người kia gửi cho bạn:
              </label>
              <input
                type="text"
                maxLength={14}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="VD: MOCHI-88"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#4A3525] bg-[#FFF8F0] text-base font-black tracking-wider text-[#4A3525] uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#4A3525] mb-1">
                Tên của bạn (Chủ 2 hoặc tên cũ để vào lại):
              </label>
              <input
                type="text"
                maxLength={18}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="VD: Hoàng Nam"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#4A3525] bg-[#FFF8F0] text-sm font-extrabold text-[#4A3525] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tactile-btn w-full py-3 rounded-2xl bg-[#88C9A1] border-2 border-[#4A3525] text-[#4A3525] font-black text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Đang kết nối...' : 'Dọn Vào Nhà Chung'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: CẤU HÌNH FIREBASE REALTIME DB */}
        {activeTab === 'firebase' && (
          <form onSubmit={handleSaveFirebaseConfig} className="space-y-2.5">
            <div className="p-2.5 rounded-2xl bg-[#FFF3D6] border-[1.8px] border-[#4A3525] text-[11px] font-bold text-[#4A3525] leading-relaxed">
              Trạng thái:{' '}
              <span className="font-black text-[#5EA87A]">
                {mode === 'firebase'
                  ? 'Đang kết nối Firebase Cloud (Chơi 2 máy Online)'
                  : 'Chế độ Local Demo'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#4A3525] mb-0.5">
                Firebase API Key
              </label>
              <input
                type="text"
                value={fbApiKey}
                onChange={(e) => setFbApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-1.5 rounded-xl border-[1.8px] border-[#4A3525] bg-[#FFF8F0] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#4A3525] mb-0.5">
                Realtime Database URL
              </label>
              <input
                type="text"
                value={fbDbUrl}
                onChange={(e) => setFbDbUrl(e.target.value)}
                placeholder="https://...-default-rtdb.asia-southeast1.firebasedatabase.app"
                className="w-full px-3 py-1.5 rounded-xl border-[1.8px] border-[#4A3525] bg-[#FFF8F0] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#4A3525] mb-0.5">
                Project ID
              </label>
              <input
                type="text"
                value={fbProjectId}
                onChange={(e) => setFbProjectId(e.target.value)}
                placeholder="petgame-ee3e9"
                className="w-full px-3 py-1.5 rounded-xl border-[1.8px] border-[#4A3525] bg-[#FFF8F0] text-xs font-mono"
              />
            </div>

            {fbSavedToast && (
              <div className="px-3 py-1.5 rounded-xl bg-[#88C9A1]/40 border border-[#4A3525] text-[#4A3525] text-xs font-black">
                {fbSavedToast}
              </div>
            )}

            <button
              type="submit"
              className="tactile-btn w-full py-2.5 rounded-2xl bg-[#FFE082] border-2 border-[#4A3525] text-[#4A3525] font-black text-xs"
            >
              Lưu Cấu Hình Kết Nối
            </button>
          </form>
        )}
      </div>

      {/* Footer chỉ dẫn nhanh */}
      <div className="text-center text-[11px] font-extrabold text-[#7D6352] pb-1">
        Trên iPhone mở bằng Safari → bấm Chia sẻ → Thêm vào MH chính
      </div>
    </div>
  );
}
