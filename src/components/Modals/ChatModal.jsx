import React, { useState } from 'react';
import { X, MessageCircleHeart, Send, Sparkles } from 'lucide-react';

const QUICK_PROMPTS = [
  'Hôm nay người kia có vào chăm con không?',
  'Mách lẻo bí mật trong phòng cho ta nghe đi!',
  'Con đang thèm ăn món gì nhất?',
  'Kể tật xấu của chủ kia đi nào!'
];

export default function ChatModal({
  isOpen,
  onClose,
  pet,
  onSendChat,
  isThinking
}) {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isThinking) return;
    const text = message.trim();
    setMessage('');
    await onSendChat(text);
  };

  const handleQuickPrompt = async (q) => {
    if (isThinking) return;
    await onSendChat(q);
  };

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#FFF9F2] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-orange-200 shadow-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircleHeart className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-base font-black text-amber-950">
                Tâm Sự Cùng {pet?.name || 'Mochi'}
              </h2>
              <p className="text-[11px] font-bold text-amber-800">
                Model phản hồi gần nhất:{' '}
                <span className="text-orange-600">{pet?.aiBubble?.modelUsed || 'Sẵn sàng'}</span>
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

        {/* Lời đáp hiện tại của Pet */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-orange-200 shadow-sm">
          <div className="text-[11px] font-extrabold text-orange-600 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{pet?.name || 'Mochi'} đang nói ({pet?.aiBubble?.emotion || 'happy'}):</span>
          </div>
          <p className="text-sm font-bold text-amber-950 leading-relaxed">
            {isThinking
              ? 'Ưm... để con vắt óc suy nghĩ câu trả lời thật khéo nha... 🐾'
              : pet?.aiBubble?.dialogue || 'Meow~ Hai chủ muốn hỏi chuyện gì nào?'}
          </p>
        </div>

        {/* Gợi ý hỏi nhanh */}
        <div>
          <span className="block text-[11px] font-extrabold text-amber-800 mb-1.5">
            Gợi ý hỏi xoáy đáp xoay:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isThinking}
                onClick={() => handleQuickPrompt(q)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-orange-100 text-amber-950 text-[11px] font-bold border border-amber-200 active:scale-95 transition-transform"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Ô nhập chat */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            maxLength={140}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Nhắn gì đó với ${pet?.name || 'Mochi'}...`}
            className="flex-1 px-3.5 py-2.5 rounded-2xl border-2 border-amber-300 bg-white text-xs font-bold text-amber-950 focus:outline-none focus:border-orange-400"
          />
          <button
            type="submit"
            disabled={isThinking || !message.trim()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 text-white text-xs font-black shadow active:scale-95 disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
