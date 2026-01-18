
import React from 'react';
import { BlockType } from '../types';

interface BlockSelectorProps {
  onAddBlock: (type: BlockType) => void;
  existingTypes: BlockType[];
}

const BlockSelector: React.FC<BlockSelectorProps> = ({ onAddBlock, existingTypes }) => {
  const accentColor = localStorage.getItem('gym_accent_color') || 'violet';
  const accentIconClass = accentColor === 'violet' ? 'text-violet-400' : 'text-emerald-400';

  const options = [
    { 
      type: BlockType.WARMUP, 
      label: 'Разминка', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2v4h4v4h4v4h-4v4h-4v-4H8v-4H4V6h4V2h4zm0 6h-2v2H8v2H6v2h2v2h2v2h4v-2h2v-2h2v-2h-2v-2h-2V8h-2z" />
        </svg>
      )
    },
    { 
      type: BlockType.CORE, 
      label: 'Основа', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 2h2v4h4v2h2v6h-2v2h-4v6h-2v-4H7v-2H5v-6h2V8h4V2zm2 8h-2v4h2v-4z" />
        </svg>
      )
    },
    { 
      type: BlockType.COOLDOWN, 
      label: 'Заминка', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 2h2v2h2v2h-2v2h-2V6H9V4h2V2zm4 6h2v2h2v2h-2v-2h-2V8zm4 6h2v2h-2v-2zm-2 4h2v2h-2v-2zm-4 2h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4-2h2v2H5v-2zm-2-4h2v2H3v-2zm0-4h2v2H3v-2zm2-4h2v2H5V6zm4-2h2v2H9V4z" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {options.map((opt) => {
        const isAdded = existingTypes.includes(opt.type);
        return (
          <button
            key={opt.type}
            disabled={isAdded}
            onClick={() => onAddBlock(opt.type)}
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black transition-all border-2 shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none uppercase text-xs tracking-tighter ${
              isAdded 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed shadow-none translate-y-1' 
                : 'bg-zinc-800 border-zinc-700 hover:border-violet-500 hover:bg-zinc-750 text-white'
            }`}
          >
            <span className={isAdded ? "text-zinc-600" : accentIconClass}>{opt.icon}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default BlockSelector;
