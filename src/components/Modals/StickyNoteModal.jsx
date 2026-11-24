import React, { useState, useRef, useEffect } from 'react';
import { X, StickyNote, Type, PenTool, Eraser, Check } from 'lucide-react';

export default function StickyNoteModal({
  isOpen,
  onClose,
  stickyNote,
  currentPlayerName,
  onSaveStickyNote
}) {
  const [mode, setMode] = useState('text'); // 'text' | 'drawing'
  const [text, setText] = useState('');
  const [brushColor, setBrushColor] = useState('#78350F');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && stickyNote) {
      setMode(stickyNote.mode || 'text');
      setText(stickyNote.text || '');
    }
  }, [isOpen, stickyNote]);

  // Khởi tạo nền giấy vàng trên Canvas khi mở tab vẽ tay
  useEffect(() => {
    if (isOpen && mode === 'drawing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FEF9C3';
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

  if (!isOpen) return null;

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
    ctx.fillStyle = '#FEF9C3';
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
        text: '[Tranh vẽ tay trên giấy nhớ]',
        drawingData: dataUrl
      });
    } else {
      onSaveStickyNote({
        mode: 'text',
        text: text.trim() || 'Chúc đằng ấy một ngày thật vui vẻ nha! 💕',
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
    <div className="fixed inset-0 z-50 bg-amber-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#FEF08A] rounded-3xl border-4 border-amber-400 shadow-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-900" />
            <div>
              <h2 className="text-base font-black text-amber-950">Giấy Nhớ Tủ Lạnh</h2>
              {stickyNote?.author && (
                <p className="text-[11px] font-bold text-amber-800">
                  Dán bởi {stickyNote.author} lúc {updatedTime}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-amber-200/80 text-amber-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nút chọn Chế độ Viết chữ / Vẽ tay */}
        <div className="grid grid-cols-2 gap-2 bg-amber-200/70 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 ${
              mode === 'text' ? 'bg-amber-900 text-white shadow' : 'text-amber-950'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Viết lời nhắn</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('drawing')}
            className={`py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 ${
              mode === 'drawing' ? 'bg-amber-900 text-white shadow' : 'text-amber-950'
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
              className="w-full p-3 rounded-2xl bg-[#FEF9C3] border-2 border-amber-400 text-sm font-bold text-amber-950 focus:outline-none"
            />
            <div className="text-right text-[11px] font-bold text-amber-800 mt-1">
              {text.length}/120 ký tự
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {['#78350F', '#EF4444', '#EC4899', '#2563EB', '#16A34A'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrushColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 ${
                      brushColor === c ? 'border-white scale-110 shadow' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="px-2.5 py-1 rounded-xl bg-amber-200 text-amber-950 text-xs font-extrabold flex items-center gap-1"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Xóa trắng</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-amber-500 shadow-inner bg-[#FEF9C3] touch-none">
              <canvas
                ref={canvasRef}
                width={260}
                height={180}
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
          className="w-full py-2.5 rounded-2xl bg-amber-900 text-white text-xs font-black shadow-md active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Dán Lên Tường Phòng ({currentPlayerName})</span>
        </button>
      </div>
    </div>
  );
}
