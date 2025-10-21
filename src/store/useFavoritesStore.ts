import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib";
import { Favorite } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

interface FavoritesState {
  favorites: Favorite[];
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;

  getCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      fetchFavorites: async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        const { data, error } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id);

        if (!error && data) set({ favorites: data });
      },

      toggleFavorite: async (productId: number) => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        const existing = get().favorites.find(
          (f) => f.product_id === productId
        );

        if (existing) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("id", existing.id);

          if (!error)
            set({
              favorites: get().favorites.filter(
                (f) => f.product_id !== productId
              ),
            });
        } else {
          const { data, error } = await supabase
            .from("favorites")
            .insert([{ user_id: user.id, product_id: productId }])
            .select()
            .single();

          if (!error && data) set({ favorites: [...get().favorites, data] });
        }
      },

      isFavorite: (productId: number) =>
        get().favorites.some((f) => f.product_id === productId),

      getCount: () => get().favorites.length,
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
