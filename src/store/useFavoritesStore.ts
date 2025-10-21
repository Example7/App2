import { create } from "zustand";
import { supabase } from "../lib/supabase";

type Favorite = {
  id: number;
  user_id: string;
  product_id: number;
};

interface FavoritesState {
  favorites: Favorite[];
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  fetchFavorites: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      set({ favorites: data });
    }
  },

  toggleFavorite: async (productId: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const existing = get().favorites.find((f) => f.product_id === productId);

    if (existing) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (!error) {
        set({
          favorites: get().favorites.filter((f) => f.product_id !== productId),
        });
      }
    } else {
      const { data, error } = await supabase
        .from("favorites")
        .insert([{ user_id: user.id, product_id: productId }])
        .select()
        .single();

      if (!error && data) {
        set({ favorites: [...get().favorites, data] });
      }
    }
  },

  isFavorite: (productId: number) => {
    return get().favorites.some((f) => f.product_id === productId);
  },
}));
