'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import RutinaApp from './RutinaApp';
import PanelEntrenador from './PanelEntrenador';
import VistaDieta from './VistaDieta';
import VistaChat from './VistaChat';
import { Dumbbell, Calendar, TrendingUp, Timer, Utensils, MessageCircle, Users, Menu, X, LogOut, ChevronRight } from 'lucide-react';

export default function MainApp() {
  const { profile, activeTab, setActiveTab, viewingClientId, setViewingClientId, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isGymTab = ['rutina', 'calendario', 'progreso', 'descanso'].includes(activeTab);
  
  // Paleta Fluye: Fondo Crema (#F4F4EB), Teal Principal (#2A7C84)
  return (
    <div className="min-h-screen bg-[#F4F4EB] text-zinc-900 pb-24 font-sans">
      
      {/* Header Estilo Fluye */}
      <header className="sticky top-0 z-30 bg-[#2A7C84] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-lg transition">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <img src={profile?.avatar_url || ''} alt="avatar" className="w-6 h-6 rounded-full" />
            <span className="text-sm font-bold truncate max-w-[120px]">{profile?.nombre_completo}</span>
          </div>
        </div>
        
        {profile?.rol === 'admin' && viewingClientId && (
          <button onClick={() => setViewingClientId(null)} className="text-xs bg-amber-500 text-zinc-900 px-3 py-1.5 rounded-full font-bold shadow-md">
            Volver a mi Rutina
          </button>
        )}
      </header>

      {/* Sidebar Lateral (Perfil y Opciones) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-[#1B3639] text-white h-full shadow-2xl flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <h2 className="text-2xl font-black tracking-wider text-[#38B2AC]">G.I. FIT</h2>
              <button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6 text-zinc-400" /></button>
            </div>
            
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <img src={profile?.avatar_url || ''} alt="avatar" className="w-16 h-16 rounded-full border-2 border-[#38B2AC]" />
                <div>
                  <h3 className="font-bold">{profile?.nombre_completo}</h3>
                  <span className="text-xs text-[#38B2AC] uppercase tracking-wider">{profile?.rol}</span>
                </div>
              </div>
              
              <button className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition">
                <span className="flex items-center gap-3"><User className="w-5 h-5 text-[#38B2AC]" /> Cambiar Avatar</span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
              
              <button onClick={() => { setSidebarOpen(false); setActiveTab('dieta'); }} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition">
                <span className="flex items-center gap-3"><Utensils className="w-5 h-5 text-[#38B2AC]" /> Mi Dieta</span>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            <div className="p-6 border-t border-white/10">
              <button onClick={logout} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full p-3 font-bold transition">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="h-full">
        {isGymTab && <RutinaApp />}
        {activeTab === 'dieta' && <VistaDieta />}
        {activeTab === 'chat' && <VistaChat />}
        {activeTab === 'clientes' && profile?.rol === 'admin' && <PanelEntrenador />}
      </main>

      {/* Menú Inferior Estilo Fluye (Dark Teal) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1B3639] border-t border-white/5 px-2 py-2 z-40 overflow-x-auto custom-scrollbar shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between min-w-max gap-4 px-2">
          <NavButton id="rutina" current={activeTab} icon={Dumbbell} label="Rutina" onClick={() => setActiveTab('rutina')} />
          <NavButton id="calendario" current={activeTab} icon={Calendar} label="Calendario" onClick={() => setActiveTab('calendario')} />
          <NavButton id="progreso" current={activeTab} icon={TrendingUp} label="Progreso" onClick={() => setActiveTab('progreso')} />
          <NavButton id="descanso" current={activeTab} icon={Timer} label="Descanso" onClick={() => setActiveTab('descanso')} />
          <NavButton id="chat" current={activeTab} icon={MessageCircle} label="Chat" onClick={() => setActiveTab('chat')} />
          {profile?.rol === 'admin' && <NavButton id="clientes" current={activeTab} icon={Users} label="Clientes" onClick={() => setActiveTab('clientes')} adminColor />}
        </div>
      </nav>
    </div>
  );
}

function NavButton({ id, current, icon: Icon, label, onClick, adminColor = false }: any) {
  const isActive = current === id;
  const activeColor = adminColor ? 'text-amber-400' : 'text-[#38B2AC]';
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-xl transition-all ${isActive ? `bg-white/10 ${activeColor}` : 'text-zinc-400 hover:text-white'}`}>
      <Icon className={`w-5 h-5 ${isActive ? 'scale-110 drop-shadow-md' : ''}`} />
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
}