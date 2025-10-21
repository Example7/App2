import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import { supabase } from "../../lib";
import { useFavoritesStore } from "../../store/useFavoritesStore";
import { useCartStore } from "../../store/useCartStore";
import { LoadingView, EmptyState } from "../../components";
import ProductCard from "../products/components/ProductCard";

export default function FavoritesScreen() {
  const { favorites, fetchFavorites, toggleFavorite } = useFavoritesStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const ids = favorites.map((f) => f.product_id);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids);

    if (error) console.error("Błąd pobierania ulubionych:", error);
    setProducts(data || []);
    setLoading(false);
  };

  if (loading)
    return <LoadingView message="Wczytywanie ulubionych produktów..." />;

  if (products.length === 0)
    return (
      <EmptyState icon="heart-outline" message="Brak ulubionych produktów" />
    );

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f5f6fa" }}>
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 14 }}
      >
        Twoje ulubione produkty
      </Text>

      <View style={{ gap: 12 }}>
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            isFavorite
            onToggleFavorite={() => toggleFavorite(item.id)}
            onAddToCart={() => addToCart(item)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
