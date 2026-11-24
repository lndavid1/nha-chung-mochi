import React, { useState } from 'react';
import { X, Camera, Upload, Heart, Check } from 'lucide-react';
import { compressImageToBase64 } from '../../utils/gameLogic';

export default function PhotoFrameModal({
  isOpen,
  onClose,
  photoFrame,
  currentPlayerName,
  onSavePhotoFrame
}) {
  const [caption, setCaption] = useState(photoFrame?.caption || 'Kỷ niệm tụi mình 💕');
  const [previewData, setPreviewData] = useState(photoFrame?.imageData || '');
  const [compressing, setCompressing] = useState(false);
  const [sizeInfo, setSizeInfo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setCompressing(true);
    try {
      const base64 = await compressImageToBase64(file, 400, 0.7);
      const approxKb = Math.round((base64.length * 3) / 4 / 1024);
      setPreviewData(base64);
      setSizeInfo(`Đã nén WebP chuẩn 400x400px (~${approxKb} KB)`);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể nén ảnh này');
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSavePhotoFrame({
      imageData: previewData || photoFrame?.imageData || '',
      caption: caption.trim() || 'Kỷ niệm tụi mình 💕',
      updatedBy: currentPlayerName,
      updatedAt: Date.now()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#FFF9F2] rounded-3xl border-4 border-orange-200 shadow-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-base font-black text-amber-950">Khung Tranh Kỷ Niệm</h2>
              <p className="text-[11px] font-bold text-amber-800">
                Tự động nén ảnh WebP &lt; 50KB lưu trực tiếp vào phòng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-amber-100 text-amber-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Khung xem trước ảnh */}
        <div className="relative mx-auto w-56 h-56 rounded-3xl bg-amber-100 p-2.5 border-4 border-amber-800 shadow-inner flex items-center justify-center overflow-hidden">
          {previewData || photoFrame?.imageData ? (
            <img
              src={previewData || photoFrame?.imageData}
              alt="Ảnh kỷ niệm"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-center p-4">
              <Heart className="w-10 h-10 text-rose-400 fill-rose-200 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-amber-900">
                Chưa có ảnh treo tường. Hãy chọn 1 bức ảnh thật đẹp của hai bạn nhé!
              </p>
            </div>
          )}
        </div>

        {sizeInfo && (
          <div className="text-center text-[11px] font-extrabold text-emerald-700 bg-emerald-50 py-1 rounded-xl">
            ✨ {sizeInfo}
          </div>
        )}

        {errorMsg && (
          <div className="text-center text-xs font-bold text-rose-600 bg-rose-50 py-1 rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-2.5">
          <label className="w-full py-2.5 px-3 rounded-2xl bg-orange-100 hover:bg-orange-200/80 border-2 border-dashed border-orange-400 text-orange-800 text-xs font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95">
            <Upload className="w-4 h-4" />
            <span>{compressing ? 'Đang nén ảnh...' : 'Chọn Ảnh Từ Điện Thoại'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div>
            <label className="block text-[11px] font-extrabold text-amber-900 mb-1">
              Lời đề tựa dưới khung tranh:
            </label>
            <input
              type="text"
              maxLength={32}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="VD: Đà Lạt tháng 11 💕"
              className="w-full px-3 py-2 rounded-xl border-2 border-amber-200 bg-white text-xs font-bold text-amber-950 focus:outline-none focus:border-orange-400"
            />
          </div>

          <button
            type="submit"
            disabled={compressing}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 text-white text-xs font-black shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Treo Lên Tường Phòng</span>
          </button>
        </form>
      </div>
    </div>
  );
}
