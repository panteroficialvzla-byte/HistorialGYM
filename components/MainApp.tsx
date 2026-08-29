'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Dumbbell, Calendar, TrendingUp, Timer, Utensils, MessageCircle, Users } from 'lucide-react';

export default function MainApp() {
  const { profile, activeTab, setActiveTab } = useStore();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      
      {/* Zona donde cargaremos las Vistas en el Paso 2 */}
      <main className="h-full">
        {activeTab === 'rutina' && <div className="p-4 text-center mt-20">Vista Rutina (Pendiente)</div>}
        {activeTab === 'calendario' && <div className="p-4 text-center mt-20">Vista Calendario (Pendiente)</div>}
        {activeTab === 'progreso' && <div className="p-4 text-center mt-20">Vista Progreso (Pendiente)</div>}
        {activeTab === 'descanso' && <div className="p-4 text-center mt-20">Vista Timer (Pendiente)</div>}
        {activeTab === 'dieta' && <div className="p-4 text-center mt-20">Vista Dieta (Pendiente)</div>}
        {activeTab === 'chat' && <div className="p-4 text-center mt-20">Vista Chat (Pendiente)</div>}
        {activeTab === 'clientes' && profile?.rol === 'admin' && <div className="p-4 text-center mt-20">Panel Admin (Pendiente)</div>}
      </main>

      {/* Barra de Navegación Inteligente */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 px-2 py-2 z-50 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between min-w-max gap-4 px-2">
          
          <NavButton id="rutina" current={activeTab} icon={Dumbbell} label="Rutina" onClick={() => setActiveTab('rutina')} />
          <NavButton id="calendario" current={activeTab} icon={Calendar} label="Calendario" onClick={() => setActiveTab('calendario')} />
          <NavButton id="progreso" current={activeTab} icon={TrendingUp} label="Progreso" onClick={() => setActiveTab('progreso')} />
          <NavButton id="descanso" current={activeTab} icon={Timer} label="Descanso" onClick={() => setActiveTab('descanso')} />
          <NavButton id="dieta" current={activeTab} icon={Utensils} label="Dieta" onClick={() => setActiveTab('dieta')} />
          <NavButton id="chat" current={activeTab} icon={MessageCircle} label="Chat" onClick={() => setActiveTab('chat')} />
          
          {/* Solo visible para ti (El Entrenador) */}
          {profile?.rol === 'admin' && (
            <NavButton id="clientes" current={activeTab} icon={Users} label="Clientes" onClick={() => setActiveTab('clientes')} adminColor />
          )}

        </div>
      </nav>
    </div>
  );
}

// Subcomponente estético para los botones de la barra inferior
function NavButton({ id, current, icon: Icon, label, onClick, adminColor = false }: any) {
  const isActive = current === id;
  const activeColor = adminColor ? 'text-emerald-400' : 'text-amber-400';
  
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-[60px] transition-colors ${isActive ? activeColor : 'text-zinc-500 hover:text-zinc-300'}`}>
      <Icon className={`w-5 h-5 ${isActive && adminColor ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}`} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}