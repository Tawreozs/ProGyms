
import React, { useState, useMemo } from 'react';
import { EXERCISE_DATABASE } from '../constants';
import { ExerciseDatabaseItem, ExerciseType, BlockType } from '../types';

interface ExercisePickerProps {
  blockType: BlockType;
  onSelect: (exercise: ExerciseDatabaseItem) => void;
  onClose: () => void;
}

const ExercisePicker: React.FC<ExercisePickerProps> = ({ blockType, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const accentColor = localStorage.getItem('gym_accent_color') || 'violet';
  const btnScale = parseFloat(localStorage.getItem('gym_btn_size') || '1');

  const categories = useMemo(() => {
    const all = Array.from(new Set(EXERCISE_DATABASE.map(ex => ex.category)));
    if (blockType === BlockType.WARMUP) return ['Кардио'];
    if (blockType === BlockType.COOLDOWN) return ['Пресс', 'Кардио', 'Растяжка'];
    return all.filter(c => c !== 'Кардио' && c !== 'Растяжка');
  }, [blockType]);

  const filtered = useMemo(() => {
    return EXERCISE_DATABASE.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
                           ex.category.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory ? ex.category === selectedCategory : true;

      if (blockType === BlockType.WARMUP) {
        return matchesSearch && ex.type === ExerciseType.CARDIO;
      }
      if (blockType === BlockType.COOLDOWN) {
        return matchesSearch && (ex.category === 'Пресс' || ex.category === 'Кардио' || ex.category === 'Растяжка');
      }
      if (blockType === BlockType.CORE) {
        return matchesSearch && ex.type === ExerciseType.STRENGTH && ex.category !== 'Растяжка' && matchesCategory;
      }
      return matchesSearch;
    });
  }, [search, blockType, selectedCategory]);

  const accentClass = accentColor === 'violet' ? 'violet' : 'emerald';

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-800 w-full max-w-lg rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-[8px_8px_0px_#000]">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
          <h3 className={`text-xl font-black italic uppercase tracking-tighter ${accentClass === 'violet' ? 'text-violet-500' : 'text-emerald-500'}`}>
            {blockType}: ДОБАВИТЬ
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg shadow-[2px_2px_0px_#000]">✕</button>
        </div>
        
        <div className="p-4 space-y-4">
          <input 
            autoFocus
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]"
          />

          {blockType === BlockType.CORE && (
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{ transform: `scale(${btnScale})`, transformOrigin: 'center' }}
                className={`px-2 py-2 rounded-lg text-[9px] font-black whitespace-nowrap transition-all border-2 shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none ${!selectedCategory ? (accentClass === 'violet' ? 'bg-violet-500 border-white text-white' : 'bg-emerald-500 border-white text-white') : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
              >
                ВСЕ ГРУППЫ
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ transform: `scale(${btnScale})`, transformOrigin: 'center' }}
                  className={`px-2 py-2 rounded-lg text-[9px] font-black whitespace-nowrap transition-all border-2 shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none ${selectedCategory === cat ? (accentClass === 'violet' ? 'bg-violet-500 border-white text-white' : 'bg-emerald-500 border-white text-white') : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-zinc-600 font-black italic uppercase tracking-widest text-xs">Ничего не найдено</div>
            ) : (
              filtered.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(ex)}
                  className="flex items-center justify-between p-4 bg-zinc-800/40 hover:bg-violet-500/10 border-2 border-zinc-700 hover:border-violet-500 rounded-xl transition-all group text-left shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]"
                >
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight">{ex.name}</div>
                    <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1 italic">{ex.category}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[8px] font-black border-2 ${
                    ex.type === ExerciseType.CARDIO ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {ex.type === ExerciseType.CARDIO ? 'CARDIO' : 'POWER'}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePicker;
