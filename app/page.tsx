'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Dumbbell, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  History, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Plus, 
  Pencil, 
  Trash2, 
  Lock, 
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface RoutineDay {
  id: number;
  day_name: string;
  muscle_group: string;
}

interface Exercise {
  id: string;
  day_id: number;
  name: string;
  default_unit: 'kg' | 'placas';
  sort_order: number;
}

interface SetEntry {
  set_number: number;
  weight: string;
  unit: 'kg' | 'placas' | 'lbs';
  reps: string;
}

export default function GymTrackerApp() {
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'charts' | 'history'>('today');
  const [routineDays, setRoutineDays] = useState<RoutineDay[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<number>(4); // Default Jueves
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [todayDateStr, setTodayDateStr] = useState<string>('');

  // Navegación de calendario
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());

  // Formulario y datos
  const [formData, setFormData] = useState<Record<string, SetEntry[]>>({});
  const [lastLogs, setLastLogs] = useState<Record<string, any>>({});
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [chartExerciseId, setChartExerciseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modal para agregar/editar ejercicio
  const [modalExerciseOpen, setModalExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [modalExName, setModalExName] = useState('');
  const [modalExUnit, setModalExUnit] = useState<'kg' | 'placas'>('kg');

  // Inicialización de fechas
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    setTodayDateStr(dateStr);
    setSelectedDateStr(dateStr);
    setCalendarViewDate(today);

    const jsDay = today.getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mie, 4 Jue, 5 Vie, 6 Sab
    if (jsDay >= 1 && jsDay <= 5) {
      setSelectedDayId(jsDay);
    } else {
      setSelectedDayId(1);
    }
    
    fetchInitialData(dateStr);
  }, []);

  const isFutureDate = useMemo(() => {
    if (!selectedDateStr || !todayDateStr) return false;
    return new Date(selectedDateStr) > new Date(todayDateStr);
  }, [selectedDateStr, todayDateStr]);

  const fetchInitialData = async (targetDate: string) => {
    setLoading(true);
    const { data: days } = await supabase.from('routine_days').select('*').order('id');
    const { data: exs } = await supabase.from('exercises').select('*').order('sort_order');
    const { data: logs } = await supabase.from('workout_logs').select('workout_date');

    if (days) setRoutineDays(days);
    if (exs) {
      setExercises(exs);
      if (exs.length > 0 && !chartExerciseId) setChartExerciseId(exs[0].id);
      initFormState(exs, targetDate);
    }

    if (logs) {
      const unique = Array.from(new Set(logs.map((l) => l.workout_date)));
      setCompletedDates(unique);
    }

    await loadHistoryAndLastWeights();
    setLoading(false);
  };

  const initFormState = async (exList: Exercise[], targetDate: string) => {
    // 1. Verificar si hay un borrador local guardado para esta fecha
    const localDraftKey = `workout_draft_${targetDate}`;
    const localDraft = typeof window !== 'undefined' ? localStorage.getItem(localDraftKey) : null;

    // 2. Buscar si ya hay datos guardados en Supabase
    const { data: existingLogs } = await supabase
      .from('workout_logs')
      .select('id, exercise_id, workout_sets(set_number, weight, unit, reps)')
      .eq('workout_date', targetDate);

    const logsByExId = (existingLogs || []).reduce((acc: any, item: any) => {
      acc[item.exercise_id] = item.workout_sets;
      return acc;
    }, {});

    let parsedDraft: Record<string, SetEntry[]> | null = null;
    if (localDraft) {
      try {
        parsedDraft = JSON.parse(localDraft);
      } catch (e) {
        parsedDraft = null;
      }
    }

    const form: Record<string, SetEntry[]> = {};
    exList.forEach((ex) => {
      // Prioridad: 1. Borrador local (en progreso), 2. Guardado en Supabase, 3. Vacío
      if (parsedDraft && parsedDraft[ex.id]) {
        form[ex.id] = parsedDraft[ex.id];
      } else {
        const savedSets = logsByExId[ex.id];
        if (savedSets && savedSets.length > 0) {
          form[ex.id] = [1, 2, 3, 4].map((num) => {
            const found = savedSets.find((s: any) => s.set_number === num);
            return {
              set_number: num,
              weight: found ? String(found.weight) : '',
              unit: found ? found.unit : ex.default_unit,
              reps: found ? String(found.reps) : '',
            };
          });
        } else {
          form[ex.id] = [1, 2, 3, 4].map((num) => ({
            set_number: num,
            weight: '',
            unit: ex.default_unit,
            reps: '',
          }));
        }
      }
    });
    setFormData(form);
  };

  const loadHistoryAndLastWeights = async () => {
    const { data } = await supabase
      .from('workout_logs')
      .select(`
        id,
        workout_date,
        exercise_id,
        exercises (name, day_id),
        workout_sets (set_number, weight, unit, reps)
      `)
      .order('workout_date', { ascending: false });

    if (data) {
      setAllHistory(data);
      const latestMap: Record<string, any> = {};
      data.forEach((log) => {
        if (!latestMap[log.exercise_id]) {
          latestMap[log.exercise_id] = log;
        }
      });
      setLastLogs(latestMap);
    }
  };

  // Manejo de cambios y autoguardado en localStorage al instante
  const handleInputChange = (
    exerciseId: string,
    setIndex: number,
    field: 'weight' | 'reps' | 'unit',
    value: string
  ) => {
    if (isFutureDate) return;

    setFormData((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      let currentSet = { ...sets[setIndex] };

      if (field === 'unit') {
        const newUnit = value as 'kg' | 'placas' | 'lbs';
        if (newUnit === 'lbs' && currentSet.weight) {
          const inKg = (parseFloat(currentSet.weight) * 0.453592).toFixed(1);
          currentSet.weight = inKg;
          currentSet.unit = 'kg';
        } else {
          currentSet.unit = newUnit;
        }
      } else if (field === 'weight') {
        currentSet.weight = value;
      } else if (field === 'reps') {
        currentSet.reps = value;
      }

      sets[setIndex] = currentSet;
      const updatedForm = { ...prev, [exerciseId]: sets };

      // Autoguardar borrador en el teléfono
      if (typeof window !== 'undefined' && selectedDateStr) {
        localStorage.setItem(`workout_draft_${selectedDateStr}`, JSON.stringify(updatedForm));
      }

      return updatedForm;
    });
  };

  // GUARDAR TODO EL ENTRENAMIENTO DEL DÍA EN UN SOLO CLIC
  const saveAllWorkoutDay = async () => {
    if (isFutureDate) {
      alert('No puedes registrar entrenamientos en días futuros.');
      return;
    }

    setIsSavingAll(true);
    setSavedSuccess(false);

    try {
      const currentDayExercises = exercises.filter((ex) => ex.day_id === selectedDayId);
      let exercisesSavedCount = 0;

      for (const ex of currentDayExercises) {
        const setsToSave = (formData[ex.id] || []).filter(
          (s) => s.weight !== '' && s.reps !== ''
        );

        if (setsToSave.length > 0) {
          // 1. Crear / actualizar log
          const { data: logData, error: logError } = await supabase
            .from('workout_logs')
            .upsert(
              { workout_date: selectedDateStr, exercise_id: ex.id },
              { onConflict: 'workout_date,exercise_id' }
            )
            .select()
            .single();

          if (logError) throw logError;

          // 2. Limpiar y guardar series
          await supabase.from('workout_sets').delete().eq('log_id', logData.id);

          const payload = setsToSave.map((s) => ({
            log_id: logData.id,
            set_number: s.set_number,
            weight: parseFloat(s.weight),
            unit: s.unit === 'lbs' ? 'kg' : s.unit,
            reps: parseInt(s.reps, 10),
          }));

          const { error: setsError } = await supabase.from('workout_sets').insert(payload);
          if (setsError) throw setsError;

          exercisesSavedCount++;
        }
      }

      if (exercisesSavedCount === 0) {
        alert('Ingresa peso y repeticiones en al menos una serie para guardar.');
        setIsSavingAll(false);
        return;
      }

      // Limpiar borrador local tras guardado exitoso
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`workout_draft_${selectedDateStr}`);
      }

      await loadHistoryAndLastWeights();
      if (!completedDates.includes(selectedDateStr)) {
        setCompletedDates((prev) => [...prev, selectedDateStr]);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSavingAll(false);
    }
  };

  // Gestión de Ejercicios
  const openModalNewExercise = () => {
    setEditingExercise(null);
    setModalExName('');
    setModalExUnit('kg');
    setModalExerciseOpen(true);
  };

  const openModalEditExercise = (ex: Exercise) => {
    setEditingExercise(ex);
    setModalExName(ex.name);
    setModalExUnit(ex.default_unit);
    setModalExerciseOpen(true);
  };

  const saveExerciseDef = async () => {
    if (!modalExName.trim()) return;

    if (editingExercise) {
      const { error } = await supabase
        .from('exercises')
        .update({ name: modalExName.trim(), default_unit: modalExUnit })
        .eq('id', editingExercise.id);
      if (!error) {
        setExercises((prev) =>
          prev.map((e) => (e.id === editingExercise.id ? { ...e, name: modalExName.trim(), default_unit: modalExUnit } : e))
        );
      }
    } else {
      const maxOrder = exercises.filter((e) => e.day_id === selectedDayId).length + 1;
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          day_id: selectedDayId,
          name: modalExName.trim(),
          default_unit: modalExUnit,
          sort_order: maxOrder,
        })
        .select()
        .single();

      if (!error && data) {
        setExercises((prev) => [...prev, data]);
        setFormData((prev) => ({
          ...prev,
          [data.id]: [1, 2, 3, 4].map((num) => ({
            set_number: num,
            weight: '',
            unit: modalExUnit,
            reps: '',
          })),
        }));
      }
    }
    setModalExerciseOpen(false);
  };

  const deleteExerciseDef = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este ejercicio y su historial?')) return;
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (!error) {
      setExercises((prev) => prev.filter((e) => e.id !== id));
      setModalExerciseOpen(false);
    }
  };

  // Calendario
  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month, d).getDay();
      daysArray.push({
        dayNumber: d,
        dateStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isCompleted: completedDates.includes(dateStr),
        isToday: dateStr === todayDateStr,
        isSelected: dateStr === selectedDateStr,
        isFuture: dateStr > todayDateStr,
      });
    }
    return daysArray;
  }, [calendarViewDate, completedDates, todayDateStr, selectedDateStr]);

  const selectDateFromCalendar = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      setSelectedDayId(dayOfWeek);
    }
    initFormState(exercises, dateStr);
    setActiveTab('today');
  };

  const currentExercises = exercises.filter((ex) => ex.day_id === selectedDayId);
  const currentDayInfo = routineDays.find((d) => d.id === selectedDayId);

  const filledCount = useMemo(() => {
    return currentExercises.filter((ex) => {
      const sets = formData[ex.id] || [];
      return sets.some((s) => s.weight !== '' && s.reps !== '');
    }).length;
  }, [currentExercises, formData]);

  const chartData = useMemo(() => {
    if (!chartExerciseId || allHistory.length === 0) return [];
    return allHistory
      .filter((h) => h.exercise_id === chartExerciseId)
      .map((h) => {
        const maxWeight = Math.max(...(h.workout_sets?.map((s: any) => Number(s.weight)) || [0]));
        const maxReps = Math.max(...(h.workout_sets?.map((s: any) => Number(s.reps)) || [0]));
        return {
          fecha: h.workout_date.slice(5),
          pesoMax: maxWeight,
          reps: maxReps,
          unidad: h.workout_sets?.[0]?.unit || 'kg',
        };
      })
      .reverse();
  }, [chartExerciseId, allHistory]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-36 font-sans">
      {/* Barra Superior */}
      <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <Dumbbell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-100">Workout Track</h1>
              <p className="text-[11px] text-zinc-400">
                {selectedDateStr === todayDateStr ? `Hoy (${selectedDateStr})` : `Fecha: ${selectedDateStr}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700/60">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-zinc-200">{completedDates.length} Sesiones</span>
          </div>
        </div>
      </header>

      {/* Bloque de aviso si es fecha futura */}
      {isFutureDate && activeTab === 'today' && (
        <div className="max-w-xl mx-auto px-4 mt-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Esta fecha es futura. No es posible registrar ni modificar datos de días que aún no han ocurrido.</span>
          </div>
        </div>
      )}

      {/* Selector de Días */}
      {activeTab === 'today' && (
        <div className="max-w-xl mx-auto px-4 mt-3">
          <div className="grid grid-cols-5 gap-1 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            {routineDays.map((d) => {
              const isSelected = d.id === selectedDayId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDayId(d.id)}
                  className={`py-2 px-1 rounded-xl text-center transition-all ${
                    isSelected 
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wider">{d.day_name.slice(0, 3)}</p>
                  <p className="text-[10px] truncate opacity-80">{d.muscle_group}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {currentDayInfo?.day_name} • <span className="text-amber-400">{currentDayInfo?.muscle_group}</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {filledCount} de {currentExercises.length} ejercicios anotados
              </p>
            </div>
            <button
              onClick={openModalNewExercise}
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1.5 rounded-lg border border-amber-400/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-xl mx-auto px-4 mt-4">
        {/* VISTA 1: REGISTRO / RUTINA */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {currentExercises.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-xs text-zinc-400 mb-3">No hay ejercicios configurados para este día.</p>
                <button
                  onClick={openModalNewExercise}
                  className="bg-amber-500 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Crear primer ejercicio
                </button>
              </div>
            ) : (
              currentExercises.map((ex) => {
                const lastLog = lastLogs[ex.id];
                const sets = formData[ex.id] || [];

                return (
                  <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-100 text-sm">{ex.name}</h3>
                        <button
                          onClick={() => openModalEditExercise(ex)}
                          className="text-zinc-500 hover:text-zinc-300 p-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Registro anterior */}
                    {lastLog && lastLog.workout_sets?.length > 0 && (
                      <div className="mb-3 bg-zinc-950 rounded-lg px-2.5 py-1.5 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                        <span>Último ({lastLog.workout_date}):</span>
                        <span className="font-semibold text-zinc-300">
                          {lastLog.workout_sets.map((s: any) => `${s.weight}${s.unit}×${s.reps}`).join(' | ')}
                        </span>
                      </div>
                    )}

                    {/* 4 Series */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-zinc-500 px-1">
                        <span className="col-span-2 text-center">Serie</span>
                        <span className="col-span-4">Peso</span>
                        <span className="col-span-3">Unidad</span>
                        <span className="col-span-3">Reps</span>
                      </div>

                      {sets.map((s, idx) => (
                        <div key={s.set_number} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-2 text-center text-xs font-bold text-zinc-400 bg-zinc-950 py-2 rounded-lg border border-zinc-800">
                            S{s.set_number}
                          </div>
                          <div className="col-span-4">
                            <input
                              type="number"
                              step="any"
                              disabled={isFutureDate}
                              placeholder="0"
                              value={s.weight}
                              onChange={(e) => handleInputChange(ex.id, idx, 'weight', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm text-zinc-100 disabled:opacity-50 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <div className="col-span-3">
                            <select
                              disabled={isFutureDate}
                              value={s.unit}
                              onChange={(e) => handleInputChange(ex.id, idx, 'unit', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-1.5 py-1.5 text-xs text-zinc-300 disabled:opacity-50 focus:border-amber-500 focus:outline-none"
                            >
                              <option value="placas">Placas</option>
                              <option value="kg">Kg</option>
                              <option value="lbs">Lbs (a kg)</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              disabled={isFutureDate}
                              placeholder="Reps"
                              value={s.reps}
                              onChange={(e) => handleInputChange(ex.id, idx, 'reps', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm text-zinc-100 disabled:opacity-50 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* BOTÓN MAESTRO DE GUARDAR ENTRENAMIENTO COMPLETO */}
            {currentExercises.length > 0 && (
              <div className="pt-2 pb-6">
                <button
                  onClick={saveAllWorkoutDay}
                  disabled={isSavingAll || isFutureDate}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isFutureDate
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : savedSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 active:scale-[0.98]'
                  }`}
                >
                  {isSavingAll ? (
                    <span>Guardando progreso...</span>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>¡Entrenamiento Guardado!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Guardar Entrenamiento del Día</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* VISTA 2: CALENDARIO */}
        {activeTab === 'calendar' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-100">
                {calendarViewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                  className="p-1.5 bg-zinc-800 rounded-lg text-zinc-300 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                  className="p-1.5 bg-zinc-800 rounded-lg text-zinc-300 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => (
                <span key={i} className="text-zinc-500 font-bold text-[10px] pb-2">{day}</span>
              ))}
              
              {calendarDays.map((item, idx) => {
                if (!item) return <div key={`empty-${idx}`} className="h-10" />;
                return (
                  <button
                    key={item.dateStr}
                    disabled={item.isFuture}
                    onClick={() => selectDateFromCalendar(item.dateStr)}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs font-semibold border transition ${
                      item.isSelected
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                        : item.isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : item.isWeekend
                        ? 'bg-zinc-950/40 border-zinc-900 text-zinc-600'
                        : item.isFuture
                        ? 'bg-zinc-950/30 border-transparent text-zinc-700 cursor-not-allowed'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span>{item.dayNumber}</span>
                    {item.isCompleted && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5"></span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA 3: PROGRESO Y GRÁFICAS */}
        {activeTab === 'charts' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <label className="text-xs font-semibold text-zinc-400 block mb-2">Selecciona un Ejercicio</label>
              <select
                value={chartExerciseId}
                onChange={(e) => setChartExerciseId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-100 focus:outline-none"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4">Evolución de Peso Máximo</h3>
              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="fecha" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="pesoMax" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 text-center py-10">Sin datos registrados aún para este ejercicio.</p>
              )}
            </div>
          </div>
        )}

        {/* VISTA 4: HISTORIAL */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {allHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-10">No hay sesiones guardadas.</p>
            ) : (
              allHistory.map((item) => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-400">{item.exercises?.name}</span>
                    <span className="text-[10px] text-zinc-500">{item.workout_date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.workout_sets?.map((s: any) => (
                      <span key={s.set_number} className="bg-zinc-950 border border-zinc-800 text-[11px] px-2 py-1 rounded-lg text-zinc-300">
                        S{s.set_number}: <b>{s.weight} {s.unit}</b> × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal para Crear / Editar Ejercicios */}
      {modalExerciseOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-100">
                {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
              </h3>
              <button onClick={() => setModalExerciseOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre del Ejercicio</label>
                <input
                  type="text"
                  value={modalExName}
                  onChange={(e) => setModalExName(e.target.value)}
                  placeholder="Ej. Press Plano (Barra)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Unidad por Defecto</label>
                <select
                  value={modalExUnit}
                  onChange={(e) => setModalExUnit(e.target.value as 'kg' | 'placas')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="kg">Kilogramos (Kg)</option>
                  <option value="placas">Placas</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {editingExercise && (
                <button
                  onClick={() => deleteExerciseDef(editingExercise.id)}
                  className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={saveExerciseDef}
                className="flex-1 bg-amber-500 text-zinc-950 font-bold text-xs py-2.5 rounded-xl hover:bg-amber-400 transition"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 py-2 px-6 z-40">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'today' ? 'text-amber-400' : 'text-zinc-500'}`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Rutina</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-amber-400' : 'text-zinc-500'}`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Calendario</span>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'charts' ? 'text-amber-400' : 'text-zinc-500'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Progreso</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-amber-400' : 'text-zinc-500'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Historial</span>
          </button>
        </div>
      </nav>
    </div>
  );
}