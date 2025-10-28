import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, mapAverageRatings } from "../lib";
import { Product } from "../types";

interface ProductState {
  products: Product[];
  ratings: Record<number, { avg: number; count: number }>;
  loading: boolean;

  fetchProducts: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      ratings: {},
      loading: false,

      fetchProducts: async () => {
        try {
          set({ loading: true });

          const [
            { data: products, error: prodErr },
            { data: reviews, error: revErr },
          ] = await Promise.all([
            supabase
              .from("products")
              .select("id, name, price, description, image_url"),
            supabase.from("reviews").select("product_id, rating"),
          ]);

          if (prodErr || revErr) {
            console.error("Błąd ładowania produktów:", prodErr || revErr);
            set({ loading: false });
            return;
          }

          const ratingsResult = mapAverageRatings(reviews || []);
          set({
            products: products ?? [],
            ratings: ratingsResult ?? {},
            loading: false,
          });
        } catch (e) {
          console.error("Błąd krytyczny podczas fetchProducts:", e);
          set({ loading: false });
        }
      },

      refreshProducts: async () => {
        try {
          const [{ data: products }, { data: reviews }] = await Promise.all([
            supabase
              .from("products")
              .select("id, name, price, description, image_url"),
            supabase.from("reviews").select("product_id, rating"),
          ]);

          const ratingsResult = mapAverageRatings(reviews || []);
          set({
            products: products ?? [],
            ratings: ratingsResult ?? {},
          });
        } catch (e) {
          console.error("Błąd podczas refreshProducts:", e);
        }
      },
    }),
    {
      name: "products-storage",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        products: state.products,
        ratings: state.ratings,
      }),
    }
  )
);
