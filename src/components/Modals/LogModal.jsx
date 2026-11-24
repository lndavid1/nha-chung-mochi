import React from 'react';
import { BookOpen, Brain, Clock } from 'lucide-react';
import BottomSheet from '../BottomSheet';

export default function LogModal({ isOpen, onClose, roomData }) {
  const logs = Array.isArray(roomData?.logs) ? roomData.logs.slice(0, 20) : [];
  const memorySummary =
    roomData?.memorySummary ||
    'Chưa có nhiều ký ức, hai bạn hãy chăm thú thường xuyên nhé!';
  const petName = roomData?.pet?.name || 'Mochi';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Sổ Tay "Mách Lẻo" Của ${petName}`}
      subtitle="20 hoạt động gần nhất của hai chủ nhân"
      icon={BookOpen}
    >
      <div className="space-y-3">
        {/* Hộp Tóm tắt ký ức AI 24h */}
        <div className="p-3.5 rounded-2xl bg-[#FFF3D6] border-2 border-[#4A3525] shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#4A3525] mb-1">
            <Brain className="w-4 h-4 text-[#E87A4D]" />
            <span>Ký Ức Thói Quen Hai Chủ (Tự cập nhật 24h/lần)</span>
          </div>
          <p className="text-xs font-bold text-[#4A3525] leading-relaxed">
            "{memorySummary}"
          </p>
        </div>

        {/* Danh sách 20 dòng nhật ký */}
        <div className="space-y-2">
          {logs.map((item) => {
            const timeStr = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '';
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#FFFDF9] border-[1.8px] border-[#4A3525] shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#E87A4D]">
                    {item.actor}
                  </span>
                  <span className="text-[10px] font-bold text-[#7D6352] flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {timeStr}
                  </span>
                </div>
                <p className="text-xs font-extrabold text-[#4A3525]">{item.action}</p>
                {item.petComment && (
                  <p className="text-[11px] font-bold text-[#4A3525] bg-[#FFF0F3] px-2.5 py-1.5 rounded-xl border border-[#4A3525]/30">
                    {petName}: "{item.petComment}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
