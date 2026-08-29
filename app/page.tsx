'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import MainApp from '@/components/MainApp';
import { Dumbbell, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const GYM_AVATARS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit1&backgroundColor=f59e0b',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit2&backgroundColor=0ea5e9',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit3&backgroundColor=10b981',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit4&backgroundColor=f43f5e',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit5&backgroundColor=8b5cf6',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit6&backgroundColor=6366f1',
];

export default function AppShell() {
  const { session, profile, setSession, fetchProfile } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Formularios
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(GYM_AVATARS[0]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) await fetchProfile(session.user.id);
      setIsInitializing(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        useStore.setState({ profile: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      alert('Error al iniciar sesión: Verifique sus credenciales.');
    } finally {
      setAuthLoading(false);
    }
  };

  const saveOnboarding = async () => {
    if (!nombre.trim()) return alert('Debes ingresar tu nombre');
    setAuthLoading(true);
    try {
      const { error } = await supabase.from('perfiles').upsert({ 
        id: session.user.id, 
        nombre_completo: nombre, 
        avatar_url: selectedAvatar,
        rol: profile?.rol || 'cliente' // Mantiene tu rol de admin si ya lo tienes
      });
      if (error) throw error;
      await fetchProfile(session.user.id);
    } catch (error: any) {
      alert('Error guardando perfil: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>;
  }

  // 1. LOGIN (Solo acceso, sin registro público)
  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/20 mb-4">
              <Dumbbell className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wider text-center">G.I. FIT JOSE</h1>
            <p className="text-xs text-zinc-400 mt-1 text-center">Bitácora de Misiones Diarias</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition" placeholder="Correo Electrónico" required />
              </div>
            </div>
            <div>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition" placeholder="Contraseña" required />
              </div>
            </div>
            <button type="submit" disabled={authLoading} className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. ONBOARDING (Nombre y Avatar la primera vez)
  if (session && (!profile || !profile.nombre_completo || !profile.avatar_url)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-center mb-2">Crea tu Identidad</h2>
          <p className="text-xs text-zinc-400 text-center mb-6">Selecciona tu avatar de entrenamiento.</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {GYM_AVATARS.map((url, idx) => (
              <button key={idx} onClick={() => setSelectedAvatar(url)} className={`rounded-full overflow-hidden border-2 transition-all duration-300 ${selectedAvatar === url ? 'border-amber-500 scale-110 shadow-lg shadow-amber-500/30' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                <img src={url} alt="avatar" className="w-full h-auto" />
              </button>
            ))}
          </div>
          <div className="mb-6">
            <div className="relative mt-1">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition" placeholder="Tu Nombre Completo" />
            </div>
          </div>
          <button onClick={saveOnboarding} disabled={authLoading} className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Comenzar</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    );
  }

  // 3. CARGAR LA APP PRINCIPAL
  return <MainApp />;
}