import { create } from "zustand";
import { supabase } from "../lib";

interface AuthState {
  session: any | null;
  loading: boolean;
  role: "user" | "admin" | null;
  fetchSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  role: null,

  fetchSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    const session = data.session ?? null;
    let role: "user" | "admin" | null = null;

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      role = profile?.role ?? "user";
    }

    set({ session, role, loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        set({ session, role: profile?.role ?? "user" });
      } else {
        set({ session: null, role: null });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, role: null });
  },
}));
