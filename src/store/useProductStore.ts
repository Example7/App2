import { create } from "zustand";
import { supabase, mapAverageRatings } from "../lib";
import { Product } from "../types";

interface ProductState {
  products: Product[];
  ratings: Record<number, { avg: number; count: number }>;
  loading: boolean;
  fetchProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductState>((set, get) => ({
  products: [],
  ratings: {},
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });

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
      loading: false,
    });

    supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        async () => {
          console.log("Zmiana w tabeli products — odświeżam dane");
          await get().fetchProducts();
        }
      )
      .subscribe();
  },
}));
