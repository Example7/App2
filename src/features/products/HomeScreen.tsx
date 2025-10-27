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
import { filterProducts, calculateAverageRatings } from "../../lib";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [reviewCounts, setReviewCounts] = useState<Record<number, number>>({});
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

    const [{ data: products }, { data: reviews }] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("reviews").select("product_id, rating"),
    ]);

    if (products) {
      setProducts(products);
      setFiltered(products);
    }

    if (reviews) {
      const { averages, counts } = calculateAverageRatings(reviews);
      setRatings(averages);
      setReviewCounts(counts);
    }

    setLoading(false);
  };

  useEffect(() => {
    setFiltered(filterProducts(products, query));
  }, [query, products]);

  if (loading) return <LoadingView message={t("home.loading")} />;

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
        <EmptyState icon="magnify" message={t("home.noProducts")} />
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
                avgRating={ratings[item.id] || 0}
                reviewCount={reviewCounts[item.id] || 0}
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
