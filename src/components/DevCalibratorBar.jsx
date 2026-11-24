import React, { useState } from 'react';
import { Sliders, Copy, Check, RotateCcw, X } from 'lucide-react';
import {
  ACCESSORY_SLOTS,
  PET_ANCHORS,
  savePetAnchorsOverride,
  resetPetAnchorsOverride
} from '../data/petAnchors';

const EMOTIONS = [
  { id: 'happy', label: 'Vui' },
  { id: 'sleepy', label: 'Ngủ' },
  { id: 'sulky', label: 'Dỗi' },
  { id: 'hungry', label: 'Đói' }
];

const ACC_OPTIONS = [
  { id: 'acc_sprout', label: 'Lá mầm' },
  { id: 'acc_bow', label: 'Nơ đỏ' },
  { id: 'acc_beret', label: 'Mũ nồi' },
  { id: 'acc_glasses', label: 'Kính tròn' },
  { id: 'acc_crown', label: 'Vương miện' },
  { id: 'acc_scarf', label: 'Khăn len' }
];

export default function DevCalibratorBar({
  isOpen,
  onClose,
  petType = 'cat',
  selectedEmotion,
  onSelectEmotion,
  selectedAccessory,
  onSelectAccessory,
  anchors,
  onChangeAnchors
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const accMeta = ACCESSORY_SLOTS[selectedAccessory] || ACCESSORY_SLOTS.acc_sprout;
  const slotName = accMeta.slot; // 'head' | 'eyes' | 'neck'
  const currentAnchor =
    anchors?.[petType]?.[selectedEmotion]?.[slotName] || {
      x: 50,
      y: 20,
      r: 0,
      s: 1
    };

  const updateField = (field, rawValue) => {
    const val = Number(rawValue);
    const next = JSON.parse(JSON.stringify(anchors));
    if (!next[petType]) next[petType] = {};
    if (!next[petType][selectedEmotion]) next[petType][selectedEmotion] = {};
    next[petType][selectedEmotion][slotName] = {
      ...currentAnchor,
      [field]: val
    };
    savePetAnchorsOverride(next);
    onChangeAnchors(next);
  };

  const handleCopyJson = () => {
    const text = JSON.stringify(anchors, null, 2);
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleReset = () => {
    resetPetAnchorsOverride();
    onChangeAnchors(JSON.parse(JSON.stringify(PET_ANCHORS)));
  };

  return (
    <div
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 10px), 10px)' }}
      className="fixed inset-x-0 bottom-0 z-[75] max-w-[430px] mx-auto bg-[#FFF8F0]/98 backdrop-blur-lg rounded-t-[28px] border-t-[2.5px] border-[#4A3525] shadow-2xl px-4 pt-3 space-y-2.5 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-[#E87A4D]" />
          <span className="text-xs font-black text-[#4A3525]">
            Dev Calibrator ({petType} • {slotName})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 rounded-xl bg-[#FFFDF9] border-[1.6px] border-[#4A3525] text-[10px] font-black text-[#4A3525] flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="px-2.5 py-1 rounded-xl bg-[#FFE082] border-[1.6px] border-[#4A3525] text-[10px] font-black text-[#4A3525] flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-[#5EA87A]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Đã copy JSON' : 'Copy JSON'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FFFDF9] border-[1.8px] border-[#4A3525] flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chọn nhanh Trạng thái cảm xúc */}
      <div className="grid grid-cols-4 gap-1.5">
        {EMOTIONS.map((em) => (
          <button
            key={em.id}
            type="button"
            onClick={() => onSelectEmotion(em.id)}
            className={`py-1 rounded-xl border-[1.6px] border-[#4A3525] text-[10.5px] font-black ${
              selectedEmotion === em.id
                ? 'bg-[#FF9B71] text-[#4A3525]'
                : 'bg-[#FFFDF9] text-[#7D6352]'
            }`}
          >
            {em.label}
          </button>
        ))}
      </div>

      {/* Chọn nhanh Phụ kiện */}
      <div className="flex gap-1.5 overflow-x-auto custom-scroll pb-0.5">
        {ACC_OPTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelectAccessory(a.id)}
            className={`px-2.5 py-1 rounded-full border-[1.6px] border-[#4A3525] text-[10px] font-black whitespace-nowrap ${
              selectedAccessory === a.id
                ? 'bg-[#88C9A1] text-[#4A3525]'
                : 'bg-[#FFFDF9] text-[#7D6352]'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* 4 Thanh trượt căn chỉnh trực tiếp X, Y, Scale, Rotate */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-[#FFFDF9] p-3 rounded-2xl border-[1.8px] border-[#4A3525] text-[10.5px] font-extrabold text-[#4A3525]">
        <label className="flex flex-col gap-0.5">
          <div className="flex justify-between tabular-nums">
            <span>Trái / Phải (X)</span>
            <span>{currentAnchor.x}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={currentAnchor.x}
            onChange={(e) => updateField('x', e.target.value)}
            className="accent-[#FF9B71]"
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <div className="flex justify-between tabular-nums">
            <span>Lên / Xuống (Y)</span>
            <span>{currentAnchor.y}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={currentAnchor.y}
            onChange={(e) => updateField('y', e.target.value)}
            className="accent-[#FF9B71]"
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <div className="flex justify-between tabular-nums">
            <span>Độ to (Scale)</span>
            <span>{currentAnchor.s}x</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.8"
            step="0.02"
            value={currentAnchor.s}
            onChange={(e) => updateField('s', e.target.value)}
            className="accent-[#88C9A1]"
          />
        </label>

        <label className="flex flex-col gap-0.5">
          <div className="flex justify-between tabular-nums">
            <span>Độ nghiêng (Rotate)</span>
            <span>{currentAnchor.r}°</span>
          </div>
          <input
            type="range"
            min="-45"
            max="45"
            step="1"
            value={currentAnchor.r}
            onChange={(e) => updateField('r', e.target.value)}
            className="accent-[#88C9A1]"
          />
        </label>
      </div>
    </div>
  );
}
