// Archivo: components/AdminDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { Users, Plus, Dumbbell, LogOut, Loader2, X, ChevronRight } from 'lucide-react';

export default function AdminDashboard() {
  const { profile, logout } = useStore();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del modal de nuevo cliente
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('rol', 'cliente')
      .order('created_at', { ascending: false });
    
    if (!error && data) setClientes(data);
    setLoading(false);
  };

  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaClave.length < 6) return alert('La clave debe tener al menos 6 caracteres');
    setCreando(true);

    try {
      const res = await fetch('/api/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nuevoEmail, password: nuevaClave, nombre: nuevoNombre })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      alert('Cliente creado exitosamente');
      setModalOpen(false);
      setNuevoEmail(''); setNuevaClave(''); setNuevoNombre('');
      fetchClientes();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20">
      <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-black text-amber-500 tracking-wider">G.I. FIT</h1>
          <p className="text-xs text-zinc-400">Panel de Entrenador</p>
        </div>
        <button onClick={logout} className="p-2 bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-400 transition">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
            <Users className="w-4 h-4" /> Mis Clientes ({clientes.length})
          </h2>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 px-3 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
        ) : clientes.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-sm">
            Aún no tienes clientes registrados.
          </div>
        ) : (
          <div className="space-y-3">
            {clientes.map(cliente => (
              <div key={cliente.id} className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition rounded-2xl p-4 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <img src={cliente.avatar_url} alt="avatar" className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800" />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 capitalize">{cliente.nombre_completo}</h3>
                    <span className="text-[10px] text-zinc-500 px-2 py-0.5 bg-zinc-950 rounded-md border border-zinc-800">
                      Cliente
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Nuevo Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCrearCliente} className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white">Registrar Cliente</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nombre Completo</label>
              <input type="text" required value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500" placeholder="Ej. Carlos Pérez" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Correo (Usuario)</label>
              <input type="email" required value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500" placeholder="carlos@correo.com" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Contraseña Provisional</label>
              <input type="text" required value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500" placeholder="123456" />
            </div>
            <button type="submit" disabled={creando} className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl transition flex justify-center mt-2">
              {creando ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}