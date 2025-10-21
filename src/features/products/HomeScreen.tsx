import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, TextInput } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { supabase } from "../../lib";
import { useCartStore, useFavoritesStore } from "../../store";
import ProductCard from "./components/ProductCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { LoadingView, EmptyState } from "../../components";
import { filterProducts } from "../../lib/helpers";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleFavorite, isFavorite, fetchFavorites } = useFavoritesStore();

  const { t } = useTranslation();

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
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    setFiltered(filterProducts(products, query));
  }, [query, products]);

  if (loading) return <LoadingView message="Wczytywanie produktów..." />;

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f5f6fa" }}>
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6, marginTop: 18 }}
      >
        {t("home.availableProducts")}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 10,
          paddingHorizontal: 6,
          marginBottom: 14,
          elevation: 1,
        }}
      >
        <IconButton icon="magnify" size={22} />
        <TextInput
          placeholder={t("home.searchPlaceholder")}
          value={query}
          onChangeText={setQuery}
          style={{
            flex: 1,
            fontSize: 16,
            paddingVertical: 8,
            color: "#222",
          }}
          placeholderTextColor="#888"
        />
        {query.length > 0 && (
          <IconButton icon="close" size={20} onPress={() => setQuery("")} />
        )}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="magnify" message="Nie znaleziono produktów" />
      ) : (
        <FlatList
          data={filtered}
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
      )}
    </View>
  );
}
