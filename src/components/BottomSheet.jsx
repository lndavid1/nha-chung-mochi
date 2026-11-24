import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Component iOS Native Bottom Sheet dùng chung cho toàn bộ các Modal
 * - Spring animation trượt từ đáy màn hình lên
 * - Grabber pill ở giữa phía trên, góc bo rounded-t-[32px]
 * - Tôn trọng env(safe-area-inset-bottom) trên iPhone
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: IconComponent,
  children,
  maxHeight = '84dvh'
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Lớp nền mờ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#4A3525]/45 backdrop-blur-[3px]"
          />

          {/* Khung Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320
            }}
            style={{
              maxHeight,
              paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)'
            }}
            className="relative z-10 w-full max-w-md bg-[#FFF8F0] rounded-t-[32px] sm:rounded-[32px] border-t-[2.5px] sm:border-[2.5px] border-[#4A3525] shadow-[0_-10px_35px_rgba(74,53,37,0.22)] flex flex-col overflow-hidden"
          >
            {/* Thanh kéo Grabber Pill chuẩn iOS */}
            <div
              onClick={onClose}
              className="pt-2.5 pb-1 flex justify-center cursor-pointer shrink-0"
            >
              <div className="w-11 h-1.5 rounded-full bg-[#4A3525]/25" />
            </div>

            {/* Header của Sheet */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-[#4A3525]/12 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {IconComponent && (
                  <div className="w-9 h-9 rounded-2xl bg-[#FF9B71]/25 border-[1.8px] border-[#4A3525] flex items-center justify-center shrink-0">
                    <IconComponent className="w-4.5 h-4.5 text-[#4A3525]" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-black text-[#4A3525] truncate">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-[11px] font-bold text-[#7D6352] truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] text-[#4A3525] flex items-center justify-center active:scale-90 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung cuộn mượt bên trong */}
            <div className="px-5 py-3.5 overflow-y-auto custom-scroll flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
