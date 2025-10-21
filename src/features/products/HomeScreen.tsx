import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import { supabase } from "../../lib";
import { useCartStore } from "../../store";
import { useFavoritesStore } from "../../store";
import ProductCard from "./components/ProductCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { LoadingView } from "../../components";

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleFavorite, isFavorite, fetchFavorites } = useFavoritesStore();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchProducts();
    fetchFavorites();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Błąd pobierania produktów:", error);
    setProducts(data || []);
    setLoading(false);
  };

  if (loading)
    return <LoadingView message="Wczytywanie ulubionych produktów..." />;

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f5f6fa" }}>
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 14 }}
      >
        Dostępne produkty
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProductDetails", { product: item })
            }
          >
            <ProductCard
              product={item}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onAddToCart={() => addToCart(item)}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
