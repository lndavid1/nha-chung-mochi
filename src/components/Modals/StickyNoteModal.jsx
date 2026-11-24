import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, Type, PenTool, Eraser, Check } from 'lucide-react';
import BottomSheet from '../BottomSheet';

export default function StickyNoteModal({
  isOpen,
  onClose,
  stickyNote,
  currentPlayerName,
  onSaveStickyNote
}) {
  const [mode, setMode] = useState('text'); // 'text' | 'drawing'
  const [text, setText] = useState('');
  const [brushColor, setBrushColor] = useState('#4A3525');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && stickyNote) {
      setMode(stickyNote.mode || 'text');
      setText(stickyNote.text || '');
    }
  }, [isOpen, stickyNote]);

  useEffect(() => {
    if (isOpen && mode === 'drawing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFF7C2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (stickyNote?.drawingData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = stickyNote.drawingData;
      }
    }
  }, [isOpen, mode, stickyNote]);

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getPointerPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const drawMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF7C2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    if (mode === 'drawing' && canvasRef.current) {
      let dataUrl = canvasRef.current.toDataURL('image/webp', 0.75);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvasRef.current.toDataURL('image/png');
      }
      onSaveStickyNote({
        mode: 'drawing',
        text: '[Tranh vẽ tay trên bảng bần]',
        drawingData: dataUrl
      });
    } else {
      onSaveStickyNote({
        mode: 'text',
        text: text.trim() || 'Chúc đằng ấy một ngày thật vui vẻ nha!',
        drawingData: ''
      });
    }
    onClose();
  };

  const updatedTime = stickyNote?.updatedAt
    ? new Date(stickyNote.updatedAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Bảng Bần & Giấy Nhớ"
      subtitle={
        stickyNote?.author
          ? `Ghim bởi ${stickyNote.author} lúc ${updatedTime}`
          : 'Gửi lời nhắn hoặc bức vẽ tay cho người kia'
      }
      icon={StickyNote}
    >
      <div className="space-y-3.5">
        {/* Nút chuyển Chế độ Viết chữ / Vẽ tay */}
        <div className="grid grid-cols-2 gap-2 bg-[#FFF0DE] p-1.5 rounded-2xl border-[1.8px] border-[#4A3525]">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              mode === 'text'
                ? 'bg-[#FFE082] text-[#4A3525] border-[1.6px] border-[#4A3525] shadow-sm'
                : 'text-[#7D6352]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Viết lời nhắn</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('drawing')}
            className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              mode === 'drawing'
                ? 'bg-[#FFE082] text-[#4A3525] border-[1.6px] border-[#4A3525] shadow-sm'
                : 'text-[#7D6352]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Vẽ tay Doodle</span>
          </button>
        </div>

        {mode === 'text' ? (
          <div>
            <textarea
              rows={4}
              maxLength={120}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Viết lời nhắn dễ thương cho người kia (tối đa 120 ký tự)..."
              className="w-full p-3.5 rounded-2xl bg-[#FFF7C2] border-2 border-[#4A3525] text-sm font-extrabold text-[#4A3525] focus:outline-none shadow-inner"
            />
            <div className="text-right text-[11px] font-bold text-[#7D6352] mt-1 tabular-nums">
              {text.length}/120 ký tự
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['#4A3525', '#E85D75', '#FF9B71', '#5EA87A', '#4A90E2'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrushColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 border-[#4A3525] transition-transform ${
                      brushColor === c ? 'scale-115 ring-2 ring-[#FFE082]' : ''
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="px-3 py-1 rounded-xl bg-[#FFFDF9] border-[1.8px] border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center gap-1"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Xóa giấy</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-[#4A3525] shadow-inner bg-[#FFF7C2] touch-none">
              <canvas
                ref={canvasRef}
                width={280}
                height={185}
                onMouseDown={startDrawing}
                onMouseMove={drawMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={drawMove}
                onTouchEnd={stopDrawing}
                className="w-full h-44 cursor-crosshair touch-none"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="tactile-btn w-full py-3 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Ghim Lên Bảng Bần ({currentPlayerName})</span>
        </button>
      </div>
    </BottomSheet>
  );
}
