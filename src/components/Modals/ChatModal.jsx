import React, { useState } from 'react';
import { MessageCircleHeart, Send, Sparkles } from 'lucide-react';
import BottomSheet from '../BottomSheet';

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
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Trò Chuyện Cùng ${pet?.name || 'Mochi'}`}
      subtitle={`Bộ não AI: ${pet?.aiBubble?.modelUsed || 'Sẵn sàng'}`}
      icon={MessageCircleHeart}
    >
      <div className="space-y-3.5">
        {/* Lời đáp hiện tại của Pet */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-[#4A3525] shadow-sm">
          <div className="text-[11px] font-black text-[#E87A4D] mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{pet?.name || 'Mochi'} thủ thỉ ({pet?.aiBubble?.emotion || 'happy'}):</span>
          </div>
          <p className="text-sm font-extrabold text-[#4A3525] leading-relaxed">
            {isThinking
              ? 'Ưm... để con vắt óc suy nghĩ câu trả lời thật khéo nha...'
              : pet?.aiBubble?.dialogue || 'Meow~ Hai chủ muốn hỏi chuyện gì nào?'}
          </p>
        </div>

        {/* Gợi ý hỏi nhanh */}
        <div>
          <span className="block text-[11px] font-extrabold text-[#7D6352] mb-1.5">
            Gợi ý hỏi nhanh:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isThinking}
                onClick={() => handleQuickPrompt(q)}
                className="px-3 py-1.5 rounded-xl bg-[#FFF0DE] hover:bg-[#FFE082] text-[#4A3525] text-[11px] font-extrabold border-[1.6px] border-[#4A3525] active:scale-95 transition-all"
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
            className="flex-1 px-3.5 py-2.5 rounded-2xl border-2 border-[#4A3525] bg-[#FFFDF9] text-xs font-extrabold text-[#4A3525] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isThinking || !message.trim()}
            className="tactile-btn px-4 py-2.5 rounded-2xl bg-[#FF9B71] border-2 border-[#4A3525] text-[#4A3525] text-xs font-black disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </BottomSheet>
  );
}
