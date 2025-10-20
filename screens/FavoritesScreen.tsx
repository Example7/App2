import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { useCartStore } from "../store/useCartStore";
import ProductCard from "../components/ProductCard";

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
    const { data } = await supabase.from("products").select("*").in("id", ids);
    setProducts(data || []);
    setLoading(false);
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Wczytywanie ulubionych...</Text>
      </View>
    );

  if (products.length === 0)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Brak ulubionych produktów</Text>
      </View>
    );

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f5f6fa" }}>
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 14 }}
      >
        Twoje ulubione produkty
      </Text>

      {products.map((item) => (
        <ProductCard
          key={item.id}
          product={item}
          isFavorite={true}
          onToggleFavorite={() => toggleFavorite(item.id)}
          onAddToCart={() => addToCart(item)}
        />
      ))}
    </ScrollView>
  );
}
