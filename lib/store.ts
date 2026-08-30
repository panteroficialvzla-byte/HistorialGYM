import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

interface UserProfile { id: string; rol: 'admin' | 'cliente'; nombre_completo: string | null; avatar_url: string | null; }

interface AppState {
  session: any | null;
  profile: UserProfile | null;
  activeTab: 'rutina' | 'calendario' | 'progreso' | 'descanso' | 'dieta' | 'chat' | 'clientes';
  viewingClientId: string | null;
  setSession: (session: any) => void;
  setProfile: (profile: UserProfile | null) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setViewingClientId: (id: string | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      session: null, profile: null, activeTab: 'rutina', viewingClientId: null,
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setViewingClientId: (id) => set({ viewingClientId: id }),
      fetchProfile: async (userId) => {
        const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single();
        if (data) set({ profile: data });
      },
      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, profile: null, activeTab: 'rutina', viewingClientId: null });
      },
    }),
    { name: 'gi-fit-storage', partialize: (state) => ({ activeTab: state.activeTab }) }
  )
);