'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { User, Loader2, CheckCircle2 } from 'lucide-react';

const GYM_AVATARS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit1&backgroundColor=f59e0b',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit2&backgroundColor=0ea5e9',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit3&backgroundColor=10b981',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit4&backgroundColor=f43f5e',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit5&backgroundColor=8b5cf6',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit6&backgroundColor=6366f1',
];

export default function VistaPerfil() {
  const { profile, setProfile } = useStore();
  const [nombre, setNombre] = useState(profile?.nombre_completo || '');
  const [avatar, setAvatar] = useState(profile?.avatar_url || GYM_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const { error } = await supabase.from('perfiles').update({
        nombre_completo: nombre,
        avatar_url: avatar
      }).eq('id', profile?.id);

      if (error) throw error;
      if (profile) {
        setProfile({ ...profile, nombre_completo: nombre, avatar_url: avatar });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 mt-6">
      <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-amber-400" /> Editar Mi Perfil
      </h2>

      <form onSubmit={guardarPerfil} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col items-center">
          <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-amber-500 bg-zinc-950 mb-4" />
          <p className="text-xs text-zinc-400">Selecciona tu nuevo avatar:</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {GYM_AVATARS.map((url, idx) => (
            <button key={idx} type="button" onClick={() => setAvatar(url)} className={`rounded-full overflow-hidden border-2 transition ${avatar === url ? 'border-amber-500 scale-105' : 'border-transparent opacity-50'}`}>
              <img src={url} alt="avatar option" className="w-full" />
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Nombre Completo</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500" required />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-amber-500 text-zinc-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <><CheckCircle2 className="w-5 h-5" /> Guardado</> : 'Actualizar Perfil'}
        </button>
      </form>
    </div>
  );
}