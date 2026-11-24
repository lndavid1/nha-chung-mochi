import React, { useState, useEffect } from 'react';
import { Camera, Upload, Heart, Check } from 'lucide-react';
import { compressImageToBase64 } from '../../utils/gameLogic';
import BottomSheet from '../BottomSheet';

export default function PhotoFrameModal({
  isOpen,
  onClose,
  photoFrame,
  currentPlayerName,
  onSavePhotoFrame
}) {
  const [caption, setCaption] = useState(photoFrame?.caption || 'Kỷ niệm tụi mình');
  const [previewData, setPreviewData] = useState(photoFrame?.imageData || '');
  const [compressing, setCompressing] = useState(false);
  const [sizeInfo, setSizeInfo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCaption(photoFrame?.caption || 'Kỷ niệm tụi mình');
      setPreviewData(photoFrame?.imageData || '');
      setSizeInfo('');
      setErrorMsg('');
    }
  }, [isOpen, photoFrame]);

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
      caption: caption.trim() || 'Kỷ niệm tụi mình',
      updatedBy: currentPlayerName,
      updatedAt: Date.now()
    });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Khung Ảnh Polaroid Kỷ Niệm"
      subtitle="Tự động nén WebP < 50KB đồng bộ tức thì vào phòng"
      icon={Camera}
    >
      <div className="space-y-3.5">
        {/* Khung xem trước kiểu Polaroid dán Washi Tape */}
        <div className="relative mx-auto w-56 bg-[#FFFDF9] p-3 pb-5 rounded-2xl border-[2.5px] border-[#4A3525] shadow-md -rotate-1">
          <span className="absolute -top-2.5 left-4 w-12 h-3.5 bg-[#FFB7C5]/90 border border-[#4A3525]/40 rounded-sm -rotate-6" />
          <span className="absolute -top-2.5 right-4 w-12 h-3.5 bg-[#88C9A1]/90 border border-[#4A3525]/40 rounded-sm rotate-6" />

          <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-[#4A3525] bg-[#FFF3E2] flex items-center justify-center">
            {previewData || photoFrame?.imageData ? (
              <img
                src={previewData || photoFrame?.imageData}
                alt="Ảnh kỷ niệm"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <Heart className="w-10 h-10 text-[#FF9B71] fill-[#FFB7C5] mx-auto mb-2" />
                <p className="text-xs font-extrabold text-[#4A3525]">
                  Chọn một bức ảnh kỷ niệm thật đẹp của hai bạn để treo lên tường nhé!
                </p>
              </div>
            )}
          </div>
          <p className="mt-2.5 text-center text-xs font-black text-[#4A3525] truncate">
            {caption || 'Kỷ niệm tụi mình'}
          </p>
        </div>

        {sizeInfo && (
          <div className="text-center text-[11px] font-extrabold text-[#4A3525] bg-[#88C9A1]/35 border border-[#4A3525] py-1.5 rounded-xl">
            {sizeInfo}
          </div>
        )}

        {errorMsg && (
          <div className="text-center text-xs font-bold text-[#4A3525] bg-[#FFB7C5] border border-[#4A3525] py-1.5 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <label className="w-full py-2.5 px-3 rounded-2xl bg-[#FFF0DE] hover:bg-[#FFE2C2] border-2 border-dashed border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95">
            <Upload className="w-4 h-4" />
            <span>{compressing ? 'Đang nén ảnh...' : 'Tải Ảnh Từ Điện Thoại'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div>
            <label className="block text-[11px] font-extrabold text-[#4A3525] mb-1">
              Dòng chữ viết tay dưới ảnh Polaroid:
            </label>
            <input
              type="text"
              maxLength={32}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="VD: Đà Lạt cùng nhau"
              className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3525] bg-[#FFFDF9] text-xs font-bold text-[#4A3525] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={compressing}
            className="tactile-btn w-full py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Dán Lên Tường Phòng</span>
          </button>
        </form>
      </div>
    </BottomSheet>
  );
}
