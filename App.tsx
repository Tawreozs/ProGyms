
import React, { useState, useEffect, useRef } from 'react';
import { 
  BlockType, 
  WorkoutBlock, 
  ExerciseType, 
  Exercise, 
  ExerciseDatabaseItem,
  WorkoutSession,
  Set
} from './types';
import BlockSelector from './components/BlockSelector';
import ExercisePicker from './components/ExercisePicker';
import { EXERCISE_DATABASE as INITIAL_DATABASE } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'build' | 'logs' | 'settings' | 'edit_db'>('build');
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);
  const [pickerOpen, setPickerOpen] = useState<{ blockId: string, type: BlockType } | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [customDatabase, setCustomDatabase] = useState<ExerciseDatabaseItem[]>([]);
  
  const [btnSize, setBtnSize] = useState<number>(1);
  const [accentColor, setAccentColor] = useState<'violet' | 'emerald'>('violet');
  
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(true);
  const [timerDuration, setTimerDuration] = useState<number>(60);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  // Инициализация данных из localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('gym_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedDB = localStorage.getItem('gym_custom_db');
    if (savedDB) {
      setCustomDatabase(JSON.parse(savedDB));
    } else {
      setCustomDatabase(INITIAL_DATABASE);
      localStorage.setItem('gym_custom_db', JSON.stringify(INITIAL_DATABASE));
    }

    const savedColor = localStorage.getItem('gym_accent_color');
    if (savedColor) setAccentColor(savedColor as any);

    const savedSize = localStorage.getItem('gym_btn_size');
    if (savedSize) setBtnSize(parseFloat(savedSize));

    const savedTimerEnabled = localStorage.getItem('gym_timer_enabled');
    if (savedTimerEnabled !== null) setIsTimerEnabled(savedTimerEnabled === 'true');

    const savedTimerDuration = localStorage.getItem('gym_timer_duration');
    if (savedTimerDuration) setTimerDuration(parseInt(savedTimerDuration));
  }, []);

  const startRestTimer = () => {
    if (!isTimerEnabled) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setRestTimer(timerDuration);
    timerRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const saveTimerSettings = (enabled: boolean, duration: number) => {
    setIsTimerEnabled(enabled);
    setTimerDuration(duration);
    localStorage.setItem('gym_timer_enabled', enabled.toString());
    localStorage.setItem('gym_timer_duration', duration.toString());
  };

  const saveAccentColor = (color: 'violet' | 'emerald') => {
    setAccentColor(color);
    localStorage.setItem('gym_accent_color', color);
    // Принудительное обновление для компонентов, зависящих от localStorage
    window.dispatchEvent(new Event('storage'));
  };

  const saveBtnSize = (size: number) => {
    setBtnSize(size);
    localStorage.setItem('gym_btn_size', size.toString());
  };

  const addBlock = (type: BlockType) => {
    const newBlock: WorkoutBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      exercises: []
    };
    const nextBlocks = [...blocks, newBlock];
    const order = { [BlockType.WARMUP]: 0, [BlockType.CORE]: 1, [BlockType.COOLDOWN]: 2 };
    nextBlocks.sort((a, b) => order[a.type] - order[b.type]);
    setBlocks(nextBlocks);
  };

  const removeBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));

  const removeExercise = (blockId: string, exId: string) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      return { ...block, exercises: block.exercises.filter(ex => ex.id !== exId) };
    }));
  };

  const getLastStats = (name: string): { sets?: Set[], cardio?: any } => {
    for (let i = history.length - 1; i >= 0; i--) {
      for (const block of history[i].blocks) {
        const found = block.exercises.find(e => e.name === name);
        if (found) {
          if (found.type === ExerciseType.STRENGTH) {
            return { sets: found.sets?.map(s => ({ ...s, completed: false })) };
          }
          return { cardio: { ...found.cardio } };
        }
      }
    }
    return {};
  };

  const addExerciseToBlock = (blockId: string, ex: ExerciseDatabaseItem) => {
    const stats = getLastStats(ex.name);
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      const newEx: Exercise = {
        id: Math.random().toString(36).substr(2, 9),
        name: ex.name,
        type: ex.type,
        sets: ex.type === ExerciseType.STRENGTH 
          ? (stats.sets || [{ reps: 10, weight: 0, completed: false }]) 
          : undefined,
        cardio: ex.type === ExerciseType.CARDIO 
          ? (stats.cardio || { speed: 5.0, time: 10, incline: 0 }) 
          : undefined
      };
      return { ...block, exercises: [...block.exercises, newEx] };
    }));
    setPickerOpen(null);
  };

  const toggleSetCompletion = (blockId: string, exId: string, setIdx: number) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        exercises: b.exercises.map(ex => {
          if (ex.id !== exId || !ex.sets) return ex;
          const newSets = [...ex.sets];
          const willComplete = !newSets[setIdx].completed;
          newSets[setIdx] = { ...newSets[setIdx], completed: willComplete };
          if (willComplete) startRestTimer();
          return { ...ex, sets: newSets };
        })
      };
    }));
  };

  const updateStrengthSet = (blockId: string, exId: string, setIdx: number, field: 'reps' | 'weight', val: number) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        exercises: b.exercises.map(ex => {
          if (ex.id !== exId || !ex.sets) return ex;
          const newSets = [...ex.sets];
          newSets[setIdx] = { ...newSets[setIdx], [field]: val };
          return { ...ex, sets: newSets };
        })
      };
    }));
  };

  const updateCardio = (blockId: string, exId: string, field: 'speed' | 'time' | 'incline', val: number) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        exercises: b.exercises.map(ex => {
          if (ex.id !== exId || !ex.cardio) return ex;
          return { ...ex, cardio: { ...ex.cardio, [field]: val } };
        })
      };
    }));
  };

  const addSet = (blockId: string, exId: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        exercises: b.exercises.map(ex => {
          if (ex.id !== exId || !ex.sets) return ex;
          const lastSet = ex.sets[ex.sets.length - 1];
          return { ...ex, sets: [...ex.sets, { ...lastSet, completed: false }] };
        })
      };
    }));
  };

  const saveWorkout = () => {
    if (blocks.length === 0) return;
    const session: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      blocks
    };
    const newHistory = [...history, session];
    setHistory(newHistory);
    localStorage.setItem('gym_history', JSON.stringify(newHistory));
    setBlocks([]);
    alert("Тренировка сохранена!");
    setActiveTab('logs');
  };

  const clearHistory = () => {
    if(confirm('Удалить всю историю?')) {
      setHistory([]);
      localStorage.removeItem('gym_history');
    }
  };

  const addToDatabase = (name: string, category: string, type: ExerciseType) => {
    const newItem = { name, category, type };
    const newDB = [...customDatabase, newItem];
    setCustomDatabase(newDB);
    localStorage.setItem('gym_custom_db', JSON.stringify(newDB));
  };

  const removeFromDatabase = (index: number) => {
    const newDB = customDatabase.filter((_, i) => i !== index);
    setCustomDatabase(newDB);
    localStorage.setItem('gym_custom_db', JSON.stringify(newDB));
  };

  const accentStyles = {
    text: accentColor === 'violet' ? 'text-violet-500' : 'text-emerald-500',
    bg: accentColor === 'violet' ? 'bg-violet-500' : 'bg-emerald-500',
    border: accentColor === 'violet' ? 'border-violet-500' : 'border-emerald-500',
    shadow: accentColor === 'violet' ? 'shadow-violet-500/20' : 'shadow-emerald-500/20',
    ring: accentColor === 'violet' ? 'ring-violet-500' : 'ring-emerald-500',
  };

  const totalSets = blocks.flatMap(b => b.exercises).flatMap(e => e.sets || []).length;
  const completedSets = blocks.flatMap(b => b.exercises).flatMap(e => e.sets || []).filter(s => s.completed).length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const BlockIcon = ({ type }: { type: BlockType }) => {
    switch (type) {
      case BlockType.WARMUP:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2v4h4v4h4v4h-4v4h-4v-4H8v-4H4V6h4V2h4zm0 6h-2v2H8v2H6v2h2v2h2v2h4v-2h2v-2h2v-2h-2v-2h-2V8h-2z" />
          </svg>
        );
      case BlockType.CORE:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 2h2v4h4v2h2v6h-2v2h-4v6h-2v-4H7v-2H5v-6h2V8h4V2zm2 8h-2v4h2v-4z" />
          </svg>
        );
      case BlockType.COOLDOWN:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 2h2v2h2v2h-2v2h-2V6H9V4h2V2zm4 6h2v2h2v2h-2v-2h-2V8zm4 6h2v2h-2v-2zm-2 4h2v2h-2v-2zm-4 2h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4-2h2v2H5v-2zm-2-4h2v2H3v-2zm0-4h2v2H3v-2zm2-4h2v2H5V6zm4-2h2v2H9V4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-44 overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white italic">Pro<span className={accentStyles.text}>GYM</span></h1>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">OPEN-SOURCE BUILDER</p>
            </div>
            {activeTab === 'build' && (
              <button 
                onClick={saveWorkout}
                disabled={blocks.length === 0}
                style={{ transform: `scale(${btnSize})` }}
                className={`${accentStyles.bg} hover:brightness-110 disabled:opacity-30 transition-all text-black font-black px-6 py-3 rounded-xl shadow-lg ${accentStyles.shadow} active:scale-95 text-sm uppercase`}
              >
                ЗАКОНЧИТЬ
              </button>
            )}
            {(activeTab === 'edit_db') && (
              <button onClick={() => setActiveTab('settings')} className="text-zinc-500 font-black text-xs uppercase">НАЗАД</button>
            )}
          </div>
          {activeTab === 'build' && totalSets > 0 && (
            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className={`h-full transition-all duration-500 ${accentStyles.bg}`} 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {activeTab === 'build' && (
          <div className="space-y-12">
            <section className="flex flex-col items-center">
              <h2 className={`text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-6 italic underline underline-offset-4 decoration-2 ${accentStyles.border.replace('border-', 'decoration-')}`}>1. СОБЕРИ БЛОКИ</h2>
              <div style={{ transform: `scale(${btnSize})` }}>
                <BlockSelector onAddBlock={addBlock} existingTypes={blocks.map(b => b.type)} />
              </div>
            </section>

            <section className="space-y-6">
              {blocks.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                  <p className="text-zinc-600 font-bold leading-relaxed italic uppercase text-xs tracking-widest">Тренировка пуста.<br/>Добавь первый блок выше.</p>
                </div>
              ) : (
                blocks.map((block) => (
                  <div key={block.id} className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-[4px_4px_0px_#000] mb-8">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-zinc-800/50 border-2 ${accentStyles.border} flex items-center justify-center ${accentStyles.text} shadow-[2px_2px_0px_#000]`}>
                          <BlockIcon type={block.type} />
                        </div>
                        <h3 className="font-black text-xl tracking-tight uppercase italic">{block.type}</h3>
                      </div>
                      <button onClick={() => removeBlock(block.id)} className="text-zinc-600 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest">УДАЛИТЬ</button>
                    </div>

                    <div className="p-5 space-y-6">
                      {block.exercises.map((ex) => {
                        const nextSetIdx = ex.sets?.findIndex(s => !s.completed);
                        return (
                          <div key={ex.id} className="bg-zinc-800/40 p-5 rounded-2xl border-2 border-zinc-800 relative group transition-all hover:bg-zinc-800/60 shadow-[2px_2px_0px_#000]">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-black text-lg text-white group-hover:text-violet-400 transition-colors italic uppercase">{ex.name}</h4>
                              <button onClick={() => removeExercise(block.id, ex.id)} className="text-zinc-700 hover:text-red-500 transition-colors font-black">✕</button>
                            </div>

                            {ex.type === ExerciseType.STRENGTH ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">
                                  <span>СЕТ</span>
                                  <span>ПОВТОРЫ</span>
                                  <span>ВЕС (КГ)</span>
                                  <span className="text-right">СТАТУС</span>
                                </div>
                                {ex.sets?.map((set, si) => (
                                  <div key={si} className={`grid grid-cols-4 items-center gap-2 p-1 rounded-xl transition-all border-2 border-transparent ${nextSetIdx === si ? `${accentStyles.border} bg-zinc-800/50` : ''} ${set.completed ? 'opacity-40 grayscale' : ''}`}>
                                    <span className={`text-center font-black ${set.completed ? 'text-emerald-500' : 'text-zinc-500'}`}>{si + 1}</span>
                                    <input type="number" value={set.reps} onChange={(e) => updateStrengthSet(block.id, ex.id, si, 'reps', parseInt(e.target.value) || 0)} className="bg-zinc-950 border-2 border-zinc-800 rounded-lg py-2 text-center text-white font-bold focus:ring-1 focus:ring-violet-500 focus:outline-none" />
                                    <input type="number" value={set.weight} onChange={(e) => updateStrengthSet(block.id, ex.id, si, 'weight', parseFloat(e.target.value) || 0)} className="bg-zinc-950 border-2 border-zinc-800 rounded-lg py-2 text-center text-white font-bold focus:ring-1 focus:ring-violet-500 focus:outline-none" />
                                    <div className="flex justify-end pr-2">
                                      <button 
                                        onClick={() => toggleSetCompletion(block.id, ex.id, si)} 
                                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${set.completed ? 'bg-emerald-500 border-white text-black shadow-[2px_2px_0px_#000]' : 'border-zinc-700 text-transparent hover:border-zinc-500'}`}
                                      >
                                        ✓
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button 
                                  onClick={() => addSet(block.id, ex.id)} 
                                  style={{ transform: `scale(${btnSize})` }}
                                  className="w-full py-4 border-2 border-zinc-700 rounded-xl text-[10px] font-black text-zinc-500 hover:text-white hover:border-zinc-500 transition-all uppercase tracking-widest bg-zinc-800/20 active:translate-y-1 active:shadow-none"
                                >
                                  + Добавить сет
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-zinc-950 p-3 rounded-xl border-2 border-zinc-800 shadow-[2px_2px_0px_#000]">
                                  <label className="block text-[9px] font-black text-zinc-600 uppercase mb-1 tracking-tighter text-center">СКОРОСТЬ</label>
                                  <input type="number" step="0.1" value={ex.cardio?.speed} onChange={(e) => updateCardio(block.id, ex.id, 'speed', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-white font-black text-lg text-center focus:outline-none" />
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-xl border-2 border-zinc-800 shadow-[2px_2px_0px_#000]">
                                  <label className="block text-[9px] font-black text-zinc-600 uppercase mb-1 tracking-tighter text-center">ВРЕМЯ (М)</label>
                                  <input type="number" value={ex.cardio?.time} onChange={(e) => updateCardio(block.id, ex.id, 'time', parseInt(e.target.value) || 0)} className="w-full bg-transparent text-white font-black text-lg text-center focus:outline-none" />
                                </div>
                                <div className="bg-zinc-950 p-3 rounded-xl border-2 border-zinc-800 shadow-[2px_2px_0px_#000]">
                                  <label className="block text-[9px] font-black text-zinc-600 uppercase mb-1 tracking-tighter text-center">УКЛОН</label>
                                  <input type="number" value={ex.cardio?.incline} onChange={(e) => updateCardio(block.id, ex.id, 'incline', parseInt(e.target.value) || 0)} className="w-full bg-transparent text-white font-black text-lg text-center focus:outline-none" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => setPickerOpen({ blockId: block.id, type: block.type })} 
                        style={{ transform: `scale(${btnSize})` }}
                        className={`w-full py-6 rounded-2xl bg-zinc-800/40 border-2 border-dashed border-zinc-700 hover:${accentStyles.border} text-zinc-500 hover:${accentStyles.text} font-black transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest active:translate-y-1 active:shadow-none`}
                      >
                        <span className="text-xl">⊕</span> Добавить упражнение
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 pb-20">
             <h2 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4 italic underline underline-offset-4 decoration-zinc-800 decoration-2">ЖУРНАЛ ТРЕНИРОВОК</h2>
             {history.length === 0 ? (
               <div className="text-center py-20 text-zinc-600 font-bold italic uppercase text-xs tracking-widest">Журнал пуст</div>
             ) : (
               [...history].reverse().map(session => (
                 <div key={session.id} className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 space-y-4 shadow-[4px_4px_0px_#000] mb-6">
                    <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-4">
                      <span className={`font-black ${accentStyles.text} italic uppercase tracking-tighter text-lg`}>{new Date(session.date).toLocaleDateString('ru-RU')}</span>
                      <span className="text-[10px] text-zinc-500 font-black border-2 border-zinc-800 px-2 py-1 rounded-lg uppercase">{new Date(session.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {session.blocks.map(b => (
                      <div key={b.id} className="space-y-2">
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                          <span className={accentStyles.text}>▶</span> {b.type}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {b.exercises.map(ex => (
                            <div key={ex.id} className="flex justify-between items-center text-sm bg-zinc-800/20 p-3 rounded-xl border-2 border-zinc-800/50">
                              <span className="text-zinc-300 font-black uppercase tracking-tighter italic">{ex.name}</span>
                              <span className="text-zinc-500 text-[10px] font-black border-2 border-zinc-800/50 px-2 py-1 rounded-lg">
                                {ex.type === ExerciseType.STRENGTH 
                                  ? `${ex.sets?.length} ПОДХОДОВ`
                                  : `${ex.cardio?.time} МИН`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
               ))
             )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 pb-20">
            <h2 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4 italic underline underline-offset-4 decoration-zinc-800 decoration-2">ОПЦИИ</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab('edit_db')}
                className="w-full bg-zinc-900 border-2 border-zinc-800 p-6 rounded-3xl flex justify-between items-center group active:translate-y-1 active:shadow-none transition-all shadow-[4px_4px_0px_#000]"
              >
                <div className="text-left">
                  <div className="font-black text-white italic uppercase tracking-tighter text-lg">БАЗА УПРАЖНЕНИЙ</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Правка списка категорий</div>
                </div>
                <span className={`${accentStyles.text} group-hover:translate-x-1 transition-transform text-xl`}>▶</span>
              </button>
              
              <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 space-y-6 shadow-[4px_4px_0px_#000]">
                <div className="space-y-4">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">РАСЦВЕТКА</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => saveAccentColor('violet')}
                      className={`flex-1 py-4 rounded-xl border-2 font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000] active:translate-y-1 active:shadow-none ${accentColor === 'violet' ? 'bg-violet-500 border-white text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                    >
                      ФИОЛЕТ
                    </button>
                    <button 
                      onClick={() => saveAccentColor('emerald')}
                      className={`flex-1 py-4 rounded-xl border-2 font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000] active:translate-y-1 active:shadow-none ${accentColor === 'emerald' ? 'bg-emerald-500 border-white text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                    >
                      ЗЕЛЕНЬ
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">ТАЙМЕР ОТДЫХА</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => saveTimerSettings(true, timerDuration)}
                        className={`flex-1 py-4 rounded-xl border-2 font-black text-[10px] uppercase transition-all shadow-[2px_2px_0px_#000] active:translate-y-1 active:shadow-none ${isTimerEnabled ? accentStyles.bg + ' ' + accentStyles.border + ' text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                      >
                        ВКЛ
                      </button>
                      <button 
                        onClick={() => saveTimerSettings(false, timerDuration)}
                        className={`flex-1 py-4 rounded-xl border-2 font-black text-[10px] uppercase transition-all shadow-[2px_2px_0px_#000] active:translate-y-1 active:shadow-none ${!isTimerEnabled ? 'bg-red-500 border-white text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                      >
                        ВЫКЛ
                      </button>
                    </div>
                    {isTimerEnabled && (
                      <div className="bg-zinc-950 border-2 border-zinc-800 p-4 rounded-xl flex items-center justify-between shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]">
                        <span className="text-zinc-500 font-black text-[10px] uppercase tracking-widest">ДЛИТЕЛЬНОСТЬ (СЕК)</span>
                        <input 
                          type="number" 
                          value={timerDuration} 
                          onChange={(e) => saveTimerSettings(true, parseInt(e.target.value) || 0)}
                          className="bg-transparent text-white font-black text-right w-20 focus:outline-none focus:text-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">РАЗМЕР КНОПОК</p>
                  <div className="flex gap-2">
                    {[0.8, 1, 1.2].map((size) => (
                      <button 
                        key={size}
                        onClick={() => saveBtnSize(size)}
                        className={`flex-1 py-4 rounded-xl border-2 font-black text-[10px] uppercase transition-all shadow-[2px_2px_0px_#000] active:translate-y-1 active:shadow-none ${btnSize === size ? accentStyles.bg + ' ' + accentStyles.border + ' text-black' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                      >
                        {size === 0.8 ? 'МИНИ' : size === 1 ? 'НОРМА' : 'МЕГА'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t-2 border-zinc-800">
                  <p className="text-red-500/50 text-[10px] font-black uppercase tracking-widest">УПРАВЛЕНИЕ ДАННЫМИ</p>
                  <button onClick={clearHistory} className="w-full bg-red-500/10 border-2 border-red-500/20 text-red-500 py-4 rounded-xl font-black text-[10px] uppercase transition-all hover:bg-red-500/20 active:translate-y-1">Очистить весь журнал</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit_db' && (
          <div className="space-y-6 pb-20">
            <h2 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4 italic underline underline-offset-4 decoration-zinc-800 decoration-2">РЕДАКТОР БАЗЫ</h2>
            <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 space-y-6 shadow-[4px_4px_0px_#000]">
               <p className="text-zinc-500 text-[10px] font-black italic uppercase tracking-widest">ТЕКУЩИЙ СПИСОК:</p>
               <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                 {customDatabase.map((ex, i) => (
                   <div key={i} className="flex justify-between items-center p-4 bg-zinc-800/40 rounded-xl border-2 border-zinc-800">
                     <div>
                       <div className="font-black text-sm text-white uppercase italic tracking-tighter">{ex.name}</div>
                       <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest italic">{ex.category}</div>
                     </div>
                     <button onClick={() => removeFromDatabase(i)} className="text-red-500/50 hover:text-red-500 p-2 font-black">✕</button>
                   </div>
                 ))}
               </div>
               <div className="pt-6 border-t-2 border-zinc-800">
                 <p className="text-zinc-400 text-[10px] font-black uppercase mb-4 tracking-widest">НОВОЕ УПРАЖНЕНИЕ:</p>
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   const form = e.target as HTMLFormElement;
                   const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                   const cat = (form.elements.namedItem('category') as HTMLSelectElement).value;
                   const type = (form.elements.namedItem('type') as HTMLSelectElement).value as ExerciseType;
                   if(name) {
                     addToDatabase(name, cat, type);
                     form.reset();
                   }
                 }} className="space-y-3">
                   <input name="name" placeholder="НАЗВАНИЕ..." className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-black uppercase tracking-tight shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]" />
                   <div className="grid grid-cols-2 gap-3">
                     <select name="category" className="bg-zinc-950 border-2 border-zinc-800 rounded-xl p-4 text-white focus:outline-none font-black uppercase text-[10px] appearance-none cursor-pointer">
                       <option value="Ноги">Ноги</option>
                       <option value="Ягодицы">Ягодицы</option>
                       <option value="Грудь">Грудь</option>
                       <option value="Спина">Спина</option>
                       <option value="Плечи">Плечи</option>
                       <option value="Руки">Руки</option>
                       <option value="Пресс">Пресс</option>
                       <option value="Икры">Икры</option>
                       <option value="Кардио">Кардио</option>
                       <option value="Растяжка">Растяжка</option>
                     </select>
                     <select name="type" className="bg-zinc-950 border-2 border-zinc-800 rounded-xl p-4 text-white focus:outline-none font-black uppercase text-[10px] appearance-none cursor-pointer">
                       <option value={ExerciseType.STRENGTH}>Сила</option>
                       <option value={ExerciseType.CARDIO}>Кардио</option>
                     </select>
                   </div>
                   <button type="submit" className={`w-full ${accentStyles.bg} text-black font-black py-5 rounded-xl shadow-[4px_4px_0px_#000] uppercase text-xs tracking-widest active:translate-y-1 active:shadow-none transition-all mt-4`}>ДОБАВИТЬ В БАЗУ</button>
                 </form>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Таймер отдыха: фиксированная стабильная позиция над табами */}
      <div className="fixed bottom-28 left-0 right-0 pointer-events-none z-40 px-6">
        <div className="max-w-2xl mx-auto flex justify-center">
          {restTimer && (
            <div className="pointer-events-auto bg-zinc-900 border-2 border-emerald-500 px-8 py-4 rounded-3xl shadow-[6px_6px_0px_#000] flex items-center gap-6 animate-bounce">
              <span className="text-emerald-500 font-black text-3xl italic uppercase tracking-tighter">ОТДЫХ: {restTimer}С</span>
              <button onClick={() => setRestTimer(null)} className="text-zinc-500 hover:text-white font-black text-2xl transition-colors">✕</button>
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-3xl border-t-2 border-zinc-800 px-8 py-6 flex justify-around items-center z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('build')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'build' ? accentStyles.text + ' scale-110' : 'text-zinc-600'}`}>
          <div className={`w-10 h-10 flex items-center justify-center text-3xl font-black ${activeTab === 'build' ? 'animate-pulse' : 'opacity-40'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h4v4H4V4zm8 0h4v4h-4V4zm8 0h4v4h-4V4zM4 12h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4zM4 20h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4z" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">СБОРКА</span>
        </button>
        <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'logs' ? accentStyles.text + ' scale-110' : 'text-zinc-600'}`}>
          <div className={`w-10 h-10 flex items-center justify-center text-3xl font-black ${activeTab === 'logs' ? '' : 'opacity-40'}`}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16h4v4H4v-4zm8-8h4v12h-4V8zm8 4h4v8h-4v-8zM2 22h20v2H2v-2z" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">ЖУРНАЛ</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'settings' || activeTab === 'edit_db' ? accentStyles.text + ' scale-110' : 'text-zinc-600'}`}>
          <div className={`w-10 h-10 flex items-center justify-center text-3xl font-black ${activeTab === 'settings' || activeTab === 'edit_db' ? 'rotate-90' : 'opacity-40'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4h4v4h-4V4zm-6 6h4v4H4v-4zm12 0h4v4h-4v-4zm-6 6h4v4h-4v-4z" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">ОПЦИИ</span>
        </button>
      </nav>

      {pickerOpen && (
        <ExercisePicker 
          blockType={pickerOpen.type} 
          onClose={() => setPickerOpen(null)} 
          onSelect={(ex) => addExerciseToBlock(pickerOpen.blockId, ex)} 
        />
      )}
    </div>
  );
};

export default App;
