import { create } from "zustand";
import { supabase, mapAverageRatings } from "../lib";
import { Product } from "../types";
import * as Sentry from "sentry-expo";

interface ProductState {
  products: Product[];
  ratings: Record<number, { avg: number; count: number }>;
  loading: boolean;
  fetchProducts: () => Promise<void>;
  initRealtime: () => void;
}

export const useProductsStore = create<ProductState>((set, get) => ({
  products: [],
  ratings: {},
  loading: false,

  fetchProducts: async () => {
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
      const err = prodErr || revErr;

      Sentry.Native.captureException(err, {
        tags: { source: "fetchProducts" },
        extra: { message: "Błąd ładowania produktów z Supabase" },
      });

      set({ loading: false });
      return;
    }

    const ratingsResult = mapAverageRatings(reviews || []);
    set({
      products: products ?? [],
      ratings: ratingsResult ?? {},
      loading: false,
    });
  },

  initRealtime: () => {
    const existingChannel = (supabase as any)._realtimeChannels?.find(
      (c: any) => c.topic === "realtime:public:products"
    );
    if (existingChannel) return;

    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        async () => {
          await get().fetchProducts();
        }
      )
      .subscribe();
  },
}));
