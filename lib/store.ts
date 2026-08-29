import { create } from 'zustand';
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
  setSession: (session: any) => void;
  fetchProfile: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  fetchProfile: async (userId) => {
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    if (data) set({ profile: data });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));