'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { 
  Dumbbell, Flame, Plus, Pencil, Trash2, Lock, X, Save, CheckCircle2, Play, Pause, RotateCcw, 
  Search, ChevronDown, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

interface RoutineDay { id: number; day_name: string; muscle_group: string; }
interface Exercise { id: string; day_id: number; name: string; default_unit: 'kg' | 'placas'; sort_order: number; user_id?: string; }
interface SetEntry { set_number: number; weight: string; unit: 'kg' | 'placas' | 'lbs'; reps: string; }

// Caché en memoria global para carga instantánea
let cachedExercises: any[] = [];
let cachedDays: any[] = [];

function getDateOfWeekDay(targetDayId: number, baseDate: Date = new Date()): string {
  const current = new Date(baseDate);
  const currentJsDay = current.getDay();
  const currentNormalized = currentJsDay === 0 ? 7 : currentJsDay;
  const diff = targetDayId - currentNormalized;
  current.setDate(current.getDate() + diff);

  const yyyy = current.getFullYear();
  const mm = String(current.getMonth() + 1).padStart(2, '0');
  const dd = String(current.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function RutinaApp() {
  const { profile, logout } = useStore();
  
  const [routineDays, setRoutineDays] = useState<RoutineDay[]>(cachedDays);
  const [exercises, setExercises] = useState<Exercise[]>(cachedExercises);
  const [selectedDayId, setSelectedDayId] = useState<number>(4);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [todayDateStr, setTodayDateStr] = useState<string>('');

  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<Record<string, SetEntry[]>>({});
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [chartExerciseId, setChartExerciseId] = useState<string>('');
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [modalExerciseOpen, setModalExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [modalExName, setModalExName] = useState('');
  const [modalExUnit, setModalExUnit] = useState<'kg' | 'placas'>('kg');

  const [activeTabLocal, setActiveTabLocal] = useState<'rutina' | 'calendario' | 'progreso' | 'descanso'>('rutina');

  const streakDays = useMemo(() => {
    const startDate = new Date('2026-08-10T00:00:00');
    const today = new Date();
    const diffTime = Math.max(0, today.getTime() - startDate.getTime());
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 17;
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    setTodayDateStr(dateStr);
    setSelectedDateStr(dateStr);

    const jsDay = today.getDay();
    const initDayId = jsDay >= 1 && jsDay <= 5 ? jsDay : 1;
    setSelectedDayId(initDayId);
    
    fetchInitialData(dateStr, initDayId);
  }, [profile?.id]);

  const isFutureDate = useMemo(() => {
    if (!selectedDateStr || !todayDateStr) return false;
    return new Date(selectedDateStr) > new Date(todayDateStr);
  }, [selectedDateStr, todayDateStr]);

  const fetchInitialData = async (targetDate: string, targetDayId: number) => {
    // Si ya tenemos caché cargada, no mostramos demora
    if (cachedExercises.length === 0) {
      const { data: days } = await supabase.from('routine_days').select('*').order('id');
      const { data: exs } = await supabase.from('exercises').select('*').eq('user_id', profile?.id).order('sort_order');
      if (days) { cachedDays = days; setRoutineDays(days); }
      if (exs) { cachedExercises = exs; setExercises(exs); }
    }

    const { data: logsWithSets } = await supabase.from('workout_logs').select('workout_date, workout_sets(id)').eq('user_id', profile?.id);
    if (logsWithSets) {
      const datesWithData = logsWithSets.filter((l: any) => l.workout_sets && l.workout_sets.length > 0).map((l: any) => l.workout_date);
      setCompletedDates(Array.from(new Set(datesWithData)));
    }

    await loadDayData(cachedExercises, targetDate, targetDayId);
    await loadAllHistory();
  };

  const loadDayData = async (exList: Exercise[], targetDate: string, dayId: number) => {
    const localDraftKey = `workout_draft_${profile?.id}_${targetDate}_${dayId}`;
    const localDraft = typeof window !== 'undefined' ? localStorage.getItem(localDraftKey) : null;

    const { data: existingLogs } = await supabase
      .from('workout_logs')
      .select('id, exercise_id, workout_date, workout_sets(set_number, weight, unit, reps)')
      .eq('workout_date', targetDate)
      .eq('user_id', profile?.id);

    const logsByExId = (existingLogs || []).reduce((acc: any, item: any) => {
      acc[item.exercise_id] = item.workout_sets;
      return acc;
    }, {});

    let parsedDraft: Record<string, SetEntry[]> | null = null;
    if (localDraft) {
      try { parsedDraft = JSON.parse(localDraft); } catch (e) { parsedDraft = null; }
    }

    const form: Record<string, SetEntry[]> = {};
    exList.forEach((ex) => {
      const savedSets = logsByExId[ex.id];
      if (savedSets && savedSets.length > 0) {
        form[ex.id] = [1, 2, 3, 4].map((num) => {
          const found = savedSets.find((s: any) => s.set_number === num);
          return { set_number: num, weight: found ? String(found.weight) : '', unit: found ? found.unit : ex.default_unit, reps: found ? String(found.reps) : '' };
        });
      } else if (parsedDraft && parsedDraft[ex.id]) {
        form[ex.id] = parsedDraft[ex.id];
      } else {
        form[ex.id] = [1, 2, 3, 4].map((num) => ({ set_number: num, weight: '', unit: ex.default_unit, reps: '' }));
      }
    });
    setFormData(form);
  };

  const loadAllHistory = async () => {
    const { data } = await supabase
      .from('workout_logs')
      .select(`id, workout_date, exercise_id, exercises (name, day_id), workout_sets (set_number, weight, unit, reps)`)
      .eq('user_id', profile?.id)
      .order('workout_date', { ascending: false });

    if (data) setAllHistory(data);
  };

  const handleSelectDay = (dayId: number) => {
    setSelectedDayId(dayId);
    const calculatedDate = getDateOfWeekDay(dayId);
    setSelectedDateStr(calculatedDate);
    loadDayData(exercises, calculatedDate, dayId);
  };

  const handleInputChange = (exerciseId: string, setIndex: number, field: 'weight' | 'reps' | 'unit', value: string) => {
    if (isFutureDate) return;
    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      let currentSet = { ...sets[setIndex] };
      if (field === 'unit') {
        const newUnit = value as 'kg' | 'placas' | 'lbs';
        if (newUnit === 'lbs' && currentSet.weight) {
          currentSet.weight = (parseFloat(currentSet.weight) * 0.453592).toFixed(1);
          currentSet.unit = 'kg';
        } else { currentSet.unit = newUnit; }
      } else if (field === 'weight') { currentSet.weight = value; } else if (field === 'reps') { currentSet.reps = value; }
      sets[setIndex] = currentSet;
      const updatedForm = { ...prev, [exerciseId]: sets };
      if (typeof window !== 'undefined' && selectedDateStr) localStorage.setItem(`workout_draft_${profile?.id}_${selectedDateStr}_${selectedDayId}`, JSON.stringify(updatedForm));
      return updatedForm;
    });
  };

  const saveAllWorkoutDay = async () => {
    if (isFutureDate) return;
    setIsSavingAll(true);
    setSavedSuccess(false);

    try {
      const currentDayExercises = exercises.filter((ex) => ex.day_id === selectedDayId);
      let exercisesSavedCount = 0;

      for (const ex of currentDayExercises) {
        const setsToSave = (formData[ex.id] || []).filter((s) => s.weight !== '' && s.reps !== '');
        if (setsToSave.length > 0) {
          const { data: logData, error: logError } = await supabase.from('workout_logs').upsert({ workout_date: selectedDateStr, exercise_id: ex.id, user_id: profile?.id }, { onConflict: 'workout_date,exercise_id,user_id' }).select().single();
          if (logError) throw logError;
          await supabase.from('workout_sets').delete().eq('log_id', logData.id);

          const payload = setsToSave.map((s) => ({
            log_id: logData.id, set_number: s.set_number, weight: parseFloat(s.weight),
            unit: s.unit === 'lbs' ? 'kg' : s.unit, reps: parseInt(s.reps, 10),
          }));
          await supabase.from('workout_sets').insert(payload);
          exercisesSavedCount++;
        }
      }
      if (exercisesSavedCount === 0) { alert('Ingresa datos para guardar.'); setIsSavingAll(false); return; }
      if (typeof window !== 'undefined') localStorage.removeItem(`workout_draft_${profile?.id}_${selectedDateStr}_${selectedDayId}`);
      if (!completedDates.includes(selectedDateStr)) setCompletedDates((prev) => [...prev, selectedDateStr]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSavingAll(false);
    }
  };

  const openModalNewExercise = () => { setEditingExercise(null); setModalExName(''); setModalExUnit('kg'); setModalExerciseOpen(true); };
  const openModalEditExercise = (ex: Exercise) => { setEditingExercise(ex); setModalExName(ex.name); setModalExUnit(ex.default_unit); setModalExerciseOpen(true); };

  const saveExerciseDef = async () => {
    if (!modalExName.trim()) return;
    if (editingExercise) {
      const { error } = await supabase.from('exercises').update({ name: modalExName.trim(), default_unit: modalExUnit }).eq('id', editingExercise.id);
      if (!error) setExercises((prev) => prev.map((e) => (e.id === editingExercise.id ? { ...e, name: modalExName.trim(), default_unit: modalExUnit } : e)));
    } else {
      const maxOrder = exercises.filter((e) => e.day_id === selectedDayId).length + 1;
      const { data, error } = await supabase.from('exercises').insert({ day_id: selectedDayId, name: modalExName.trim(), default_unit: modalExUnit, sort_order: maxOrder, user_id: profile?.id }).select().single();
      if (!error && data) {
        setExercises((prev) => [...prev, data]);
        cachedExercises = [...cachedExercises, data];
        setFormData((prev) => ({ ...prev, [data.id]: [1, 2, 3, 4].map((num) => ({ set_number: num, weight: '', unit: modalExUnit, reps: '' })) }));
      }
    }
    setModalExerciseOpen(false);
  };

  const deleteExerciseDef = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este ejercicio?')) return;
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (!error) { setExercises((prev) => prev.filter((e) => e.id !== id)); setModalExerciseOpen(false); }
  };

  const currentExercises = exercises.filter((ex) => ex.day_id === selectedDayId);
  const currentDayInfo = routineDays.find((d) => d.id === selectedDayId);
  const filledCount = useMemo(() => {
    return currentExercises.filter((ex) => {
      const sets = formData[ex.id] || [];
      return sets.some((s) => s.weight !== '' && s.reps !== '');
    }).length;
  }, [currentExercises, formData]);

  return (
    <div className="w-full max-w-xl mx-auto pb-20">
      {/* Barra Superior */}
      <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-9 h-9 rounded-full border-2 border-amber-500" />
          ) : (
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20"><Dumbbell className="w-5 h-5 text-amber-400" /></div>
          )}
          <div>
            <h1 className="text-sm font-bold text-zinc-100">Mi Bitácora</h1>
            <p className="text-[11px] text-zinc-400 capitalize">{profile?.nombre_completo || 'G.I. FIT'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-black text-amber-300">{streakDays} Días</span>
          </div>
          <button onClick={logout} className="p-1.5 text-zinc-500 hover:text-red-400"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Selector de Días Lunes a Viernes */}
        <div className="grid grid-cols-5 gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          {routineDays.map((d) => (
            <button key={d.id} onClick={() => handleSelectDay(d.id)} className={`py-2 px-1 rounded-xl text-center transition-all ${d.id === selectedDayId ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <p className="text-[11px] uppercase tracking-wider">{d.day_name.slice(0, 3)}</p>
              <p className="text-[10px] truncate opacity-80">{d.muscle_group}</p>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100">{currentDayInfo?.day_name} • <span className="text-amber-400">{currentDayInfo?.muscle_group}</span></h2>
            <p className="text-[11px] text-zinc-400">{filledCount} de {currentExercises.length} ejercicios anotados ({selectedDateStr})</p>
          </div>
          <button onClick={openModalNewExercise} className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1.5 rounded-lg border border-amber-400/20 transition">
            <Plus className="w-3.5 h-3.5" /><span>Añadir</span>
          </button>
        </div>

        {/* Ejercicios */}
        {currentExercises.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center"><p className="text-xs text-zinc-400">No hay ejercicios para este día.</p></div>
        ) : (
          currentExercises.map((ex) => (
            <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-zinc-100 text-sm">{ex.name}</h3>
                <button onClick={() => openModalEditExercise(ex)} className="text-zinc-500 hover:text-zinc-300 p-1"><Pencil className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-zinc-500 px-1">
                  <span className="col-span-2 text-center">Serie</span><span className="col-span-4">Peso</span><span className="col-span-3">Unid</span><span className="col-span-3">Reps</span>
                </div>
                {(formData[ex.id] || []).map((s, idx) => (
                  <div key={s.set_number} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2 text-center text-xs font-bold text-zinc-400 bg-zinc-950 py-2 rounded-lg border border-zinc-800">S{s.set_number}</div>
                    <div className="col-span-4"><input type="number" step="any" disabled={isFutureDate} value={s.weight} onChange={(e) => handleInputChange(ex.id, idx, 'weight', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-amber-400 focus:border-amber-500 focus:outline-none disabled:opacity-50" placeholder="0" /></div>
                    <div className="col-span-3">
                      <select disabled={isFutureDate} value={s.unit} onChange={(e) => handleInputChange(ex.id, idx, 'unit', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-1.5 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none disabled:opacity-50">
                        <option value="placas">Plac</option><option value="kg">Kg</option><option value="lbs">Lbs</option>
                      </select>
                    </div>
                    <div className="col-span-3"><input type="number" disabled={isFutureDate} value={s.reps} onChange={(e) => handleInputChange(ex.id, idx, 'reps', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none disabled:opacity-50" placeholder="0" /></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {currentExercises.length > 0 && (
          <div className="pt-2 pb-6">
            <button onClick={saveAllWorkoutDay} disabled={isSavingAll || isFutureDate} className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${isFutureDate ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : savedSuccess ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 active:scale-[0.98]'}`}>
              {isSavingAll ? <span>Guardando progreso...</span> : savedSuccess ? <><CheckCircle2 className="w-5 h-5" /><span>¡Entrenamiento Guardado!</span></> : <><Save className="w-5 h-5" /><span>Guardar Entrenamiento ({selectedDateStr})</span></>}
            </button>
          </div>
        )}
      </div>

      {/* Modal Crear Ejercicios */}
      {modalExerciseOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-100">{editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h3>
              <button onClick={() => setModalExerciseOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre del Ejercicio</label>
                <input type="text" value={modalExName} onChange={(e) => setModalExName(e.target.value)} placeholder="Ej. Press Plano (Barra)" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Unidad por Defecto</label>
                <select value={modalExUnit} onChange={(e) => setModalExUnit(e.target.value as 'kg' | 'placas')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500">
                  <option value="kg">Kilogramos (Kg)</option><option value="placas">Placas</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              {editingExercise && <button onClick={() => deleteExerciseDef(editingExercise.id)} className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>}
              <button onClick={saveExerciseDef} className="flex-1 bg-amber-500 text-zinc-950 font-bold text-xs py-2.5 rounded-xl hover:bg-amber-400 transition">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}