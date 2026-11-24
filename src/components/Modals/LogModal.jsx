import React from 'react';
import { X, BookOpen, Brain, Clock } from 'lucide-react';

export default function LogModal({ isOpen, onClose, roomData }) {
  if (!isOpen) return null;

  const logs = Array.isArray(roomData?.logs) ? roomData.logs.slice(0, 20) : [];
  const memorySummary =
    roomData?.memorySummary || 'Chưa có nhiều ký ức, hai bạn hãy chăm thú thường xuyên nhé!';
  const petName = roomData?.pet?.name || 'Mochi';

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#FFF9F2] rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-orange-200 shadow-2xl max-h-[84dvh] flex flex-col overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-between border-b border-orange-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-base font-black text-amber-950">
                Nhật Ký "Mách Lẻo" Của {petName}
              </h2>
              <p className="text-[11px] font-bold text-amber-800">
                Lưu 20 hoạt động gần nhất của hai chủ nhân
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

        <div className="p-4 overflow-y-auto custom-scroll space-y-3 flex-1">
          {/* Hộp Tóm tắt ký ức AI 24h */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 to-rose-50 border-2 border-orange-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-black text-orange-700 mb-1">
              <Brain className="w-4 h-4" />
              <span>Ký Ức Thói Quen Hai Chủ (Tự cập nhật 24h/lần)</span>
            </div>
            <p className="text-xs font-bold text-amber-950 leading-relaxed">
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
                  className="p-3 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-600">
                      {item.actor}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-amber-950">{item.action}</p>
                  {item.petComment && (
                    <p className="text-[11px] font-semibold text-rose-700 bg-rose-50/80 px-2.5 py-1 rounded-xl border border-rose-100">
                      🐾 {petName}: "{item.petComment}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
