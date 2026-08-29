import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

interface UserProfile {
  id: string;
  rol: 'admin' | 'cliente';
  nombre_completo: string | null;
  avatar_url: string | null;
  entrenador_id: string | null;
}

interface AppState {
  session: any | null;
  profile: UserProfile | null;
  activeTab: 'rutina' | 'calendario' | 'progreso' | 'descanso' | 'dieta' | 'chat' | 'clientes';
  setSession: (session: any) => void;
  setProfile: (profile: UserProfile | null) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  fetchProfile: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      session: null,
      profile: null,
      activeTab: 'rutina', // Pestaña por defecto
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      fetchProfile: async (userId) => {
        const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single();
        if (data) set({ profile: data });
      },
      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, profile: null, activeTab: 'rutina' });
      },
    }),
    {
      name: 'gi-fit-storage', // Guarda el estado en la memoria del teléfono
      partialize: (state) => ({ activeTab: state.activeTab }), // Solo recuerda la pestaña activa al recargar
    }
  )
);