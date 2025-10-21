import { create } from "zustand";
import { supabase } from "../lib";

interface AuthState {
  session: any | null;
  loading: boolean;
  fetchSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,

  fetchSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    set({ session: data.session ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
