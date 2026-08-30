'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { Plus, Pencil, Trash2, Save, CheckCircle2, Play, Pause, Square, RotateCcw, Search, ChevronDown, Activity, ChevronLeft, ChevronRight, Dumbbell, Flame, LogOut, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Exercise { id: string; day_id: number; name: string; default_unit: 'kg' | 'placas'; sort_order: number; }
interface SetEntry { set_number: number; weight: string; unit: 'kg' | 'placas' | 'lbs'; reps: string; }

let cachedExercises: any[] = [];
let cachedHistory: any[] = [];

export default function RutinaApp() {
  const { profile, viewingClientId } = useStore();
  const activeUserId = viewingClientId || profile?.id; // Lógica Admin viendo a Cliente
  const isAdminViewing = !!viewingClientId;

  const [routineDays, setRoutineDays] = useState<any[]>([{id:1, day_name:'Lunes', muscle_group:'Pecho'}, {id:2, day_name:'Martes', muscle_group:'Espalda'}, {id:3, day_name:'Miércoles', muscle_group:'Piernas'}, {id:4, day_name:'Jueves', muscle_group:'Hombros'}, {id:5, day_name:'Viernes', muscle_group:'Brazos'}]);
  const [exercises, setExercises] = useState<Exercise[]>(cachedExercises);
  const [selectedDayId, setSelectedDayId] = useState<number>(new Date().getDay() || 1);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState<Record<string, SetEntry[]>>({});
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [chartExerciseId, setChartExerciseId] = useState<string>('');
  
  // Modales
  const [modalExerciseOpen, setModalExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [modalExName, setModalExName] = useState('');
  const [modalExUnit, setModalExUnit] = useState<'kg' | 'placas'>('kg');
  
  // Autocompletado de ejercicios
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  // Temporizador Sonoro
  const [countdownMs, setCountdownMs] = useState(60000);
  const [initialCountdownMs, setInitialCountdownMs] = useState(60000);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.com/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.loop = true;
    fetchInitialData();
  }, [activeUserId]);

  const fetchInitialData = async () => {
    const { data: exs } = await supabase.from('exercises').select('*').eq('user_id', activeUserId).order('sort_order');
    if (exs) {
      setExercises(exs);
      cachedExercises = exs;
      const nombresUnicos = Array.from(new Set(exs.map(e => e.name)));
      setSugerencias(nombresUnicos as string[]);
    }
    await loadDayData(exs || [], selectedDateStr, selectedDayId);
  };

  const loadDayData = async (exList: Exercise[], targetDate: string, dayId: number) => {
    const { data: existingLogs } = await supabase.from('workout_logs').select('exercise_id, workout_sets(set_number, weight, unit, reps)').eq('workout_date', targetDate).eq('user_id', activeUserId);
    const logsByExId = (existingLogs || []).reduce((acc: any, item: any) => { acc[item.exercise_id] = item.workout_sets; return acc; }, {});
    
    const form: Record<string, SetEntry[]> = {};
    exList.filter(e => e.day_id === dayId).forEach((ex) => {
      if (logsByExId[ex.id]?.length > 0) {
        form[ex.id] = [1, 2, 3, 4].map(num => {
          const f = logsByExId[ex.id].find((s: any) => s.set_number === num);
          return { set_number: num, weight: f ? String(f.weight) : '', unit: f ? f.unit : ex.default_unit, reps: f ? String(f.reps) : '' };
        });
      } else {
        form[ex.id] = [1, 2, 3, 4].map(num => ({ set_number: num, weight: '', unit: ex.default_unit, reps: '' }));
      }
    });
    setFormData(form);
  };

  const handleInputChange = (exId: string, idx: number, field: string, value: string) => {
    setFormData(prev => {
      const sets = [...(prev[exId] || [])];
      sets[idx] = { ...sets[idx], [field]: value };
      return { ...prev, [exId]: sets };
    });
  };

  const saveAllWorkoutDay = async () => {
    try {
      const currentExs = exercises.filter(ex => ex.day_id === selectedDayId);
      for (const ex of currentExs) {
        const setsToSave = (formData[ex.id] || []).filter(s => s.weight && s.reps);
        if (setsToSave.length > 0) {
          const { data: logData } = await supabase.from('workout_logs').upsert({ workout_date: selectedDateStr, exercise_id: ex.id, user_id: activeUserId }, { onConflict: 'workout_date,exercise_id,user_id' }).select().single();
          if (logData) {
            await supabase.from('workout_sets').delete().eq('log_id', logData.id);
            await supabase.from('workout_sets').insert(setsToSave.map(s => ({ log_id: logData.id, set_number: s.set_number, weight: parseFloat(s.weight), unit: s.unit, reps: parseInt(s.reps, 10) })));
          }
        }
      }
      alert('Guardado con éxito');
    } catch (e) {}
  };

  const saveExerciseDef = async () => {
    if (!modalExName.trim()) return;
    if (editingExercise) {
      await supabase.from('exercises').update({ name: modalExName.trim(), default_unit: modalExUnit }).eq('id', editingExercise.id);
      setExercises(prev => prev.map(e => e.id === editingExercise.id ? { ...e, name: modalExName.trim() } : e));
    } else {
      const maxOrder = exercises.filter(e => e.day_id === selectedDayId).length + 1;
      const { data } = await supabase.from('exercises').insert({ day_id: selectedDayId, name: modalExName.trim(), default_unit: modalExUnit, sort_order: maxOrder, user_id: activeUserId }).select().single();
      if (data) {
        setExercises(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, [data.id]: [1, 2, 3, 4].map(n => ({ set_number: n, weight: '', unit: modalExUnit, reps: '' })) }));
      }
    }
    setModalExerciseOpen(false);
  };

  // Motor de Temporizador en Segundo Plano
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCountdownRunning && targetTime) {
      interval = setInterval(() => {
        const remaining = Math.max(0, targetTime - Date.now());
        setCountdownMs(remaining);
        if (remaining === 0) {
          setIsCountdownRunning(false);
          if (audioRef.current) audioRef.current.play();
          if ('vibrate' in navigator) navigator.vibrate([1000, 500, 1000]);
          clearInterval(interval);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isCountdownRunning, targetTime]);

  const detenerAlarma = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setCountdownMs(initialCountdownMs);
    setTargetTime(null);
  };

  const formatTime = (ms: number) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
  const currentExercises = exercises.filter((ex) => ex.day_id === selectedDayId);

  return (
    <div className="p-4 space-y-6">
      
      {/* Selector de Días Limpio */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {routineDays.map(d => (
          <button key={d.id} onClick={() => { setSelectedDayId(d.id); loadDayData(exercises, selectedDateStr, d.id); }} className={`min-w-[80px] py-2 rounded-2xl flex flex-col items-center transition shadow-sm ${d.id === selectedDayId ? 'bg-[#2A7C84] text-white shadow-[#2A7C84]/30' : 'bg-white text-zinc-500 border border-zinc-200'}`}>
            <span className="text-[10px] font-bold uppercase">{d.day_name.slice(0,3)}</span>
            <span className="text-[11px] font-medium">{d.muscle_group}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-[#1B3639]">{routineDays.find(d => d.id === selectedDayId)?.day_name}</h2>
        <button onClick={() => { setEditingExercise(null); setModalExName(''); setModalExerciseOpen(true); }} className="flex items-center gap-1 bg-amber-500 text-zinc-900 px-3 py-1.5 rounded-full font-bold text-xs shadow-md">
          <Plus className="w-4 h-4" /> Añadir Ejercicio
        </button>
      </div>

      {/* Lista de Ejercicios */}
      <div className="space-y-4">
        {currentExercises.map(ex => (
          <div key={ex.id} className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#2A7C84]">{ex.name}</h3>
              <button onClick={() => { setEditingExercise(ex); setModalExName(ex.name); setModalExUnit(ex.default_unit); setModalExerciseOpen(true); }}><Pencil className="w-4 h-4 text-zinc-400" /></button>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-zinc-400 uppercase">
                <span className="col-span-2 text-center">Set</span><span className="col-span-4">Peso</span><span className="col-span-3">Unid</span><span className="col-span-3">Reps</span>
              </div>
              {(formData[ex.id] || []).map((s, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2 text-center text-xs font-bold bg-[#F4F4EB] text-[#2A7C84] py-2 rounded-xl">S{s.set_number}</div>
                  <div className="col-span-4"><input type="number" step="any" value={s.weight} onChange={e => handleInputChange(ex.id, idx, 'weight', e.target.value)} className="w-full bg-[#F4F4EB] rounded-xl px-2 py-2 text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-[#38B2AC]" placeholder="0" /></div>
                  <div className="col-span-3">
                    <select value={s.unit} onChange={e => handleInputChange(ex.id, idx, 'unit', e.target.value)} className="w-full bg-[#F4F4EB] rounded-xl px-1 py-2 text-xs font-semibold text-zinc-600 outline-none">
                      <option value="placas">Plac</option><option value="kg">Kg</option><option value="lbs">Lbs</option>
                    </select>
                  </div>
                  <div className="col-span-3"><input type="number" value={s.reps} onChange={e => handleInputChange(ex.id, idx, 'reps', e.target.value)} className="w-full bg-[#F4F4EB] rounded-xl px-2 py-2 text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-[#38B2AC]" placeholder="0" /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {currentExercises.length > 0 && (
        <button onClick={saveAllWorkoutDay} className="w-full bg-[#2A7C84] text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-[#2A7C84]/30 active:scale-95 transition">
          <Save className="w-5 h-5" /> GUARDAR RUTINA
        </button>
      )}

      {/* Temporizador Flotante Minimalista */}
      <div className="fixed bottom-24 right-4 bg-white p-3 rounded-3xl shadow-2xl border border-zinc-100 flex flex-col items-center gap-2 z-40">
        <span className="text-xl font-black text-[#1B3639] font-mono">{formatTime(countdownMs)}</span>
        {countdownMs === 0 ? (
          <button onClick={detenerAlarma} className="bg-red-500 text-white p-3 rounded-full animate-bounce"><Square className="w-5 h-5 fill-current" /></button>
        ) : (
          <button onClick={() => { if(isCountdownRunning) { setIsCountdownRunning(false); setTargetTime(null); } else { setTargetTime(Date.now() + countdownMs); setIsCountdownRunning(true); } }} className="bg-amber-500 text-zinc-900 p-3 rounded-full shadow-md shadow-amber-500/40">
            {isCountdownRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
        )}
      </div>

      {/* Modal Añadir Ejercicio Estilo Fluye */}
      {modalExerciseOpen && (
        <div className="fixed inset-0 bg-[#1B3639]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black text-[#2A7C84] mb-4 text-center">{editingExercise ? 'Editar' : 'Crear'} Ejercicio</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Nombre</label>
                <input type="text" list="sugerencias-ex" value={modalExName} onChange={e => setModalExName(e.target.value)} placeholder="Ej. Jalón al Pecho" className="w-full bg-[#F4F4EB] rounded-2xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]" />
                <datalist id="sugerencias-ex">
                  {sugerencias.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Medida Principal</label>
                <select value={modalExUnit} onChange={e => setModalExUnit(e.target.value as any)} className="w-full bg-[#F4F4EB] rounded-2xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]">
                  <option value="kg">Kilogramos (Kg)</option><option value="placas">Placas de Máquina</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setModalExerciseOpen(false)} className="flex-1 py-4 text-zinc-500 font-bold bg-zinc-100 rounded-2xl">Cancelar</button>
              <button onClick={saveExerciseDef} className="flex-1 py-4 bg-[#38B2AC] text-white font-black rounded-2xl shadow-lg shadow-[#38B2AC]/40">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}