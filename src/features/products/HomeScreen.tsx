import React, { useEffect, useCallback, useState } from "react";
import { View, FlatList, TouchableOpacity, TextInput } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { filterProducts } from "../../lib";
import { useCartStore, useFavoritesStore, useProductsStore } from "../../store";
import ProductCard from "./components/ProductCard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { LoadingView, EmptyState } from "../../components";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { products, ratings, loading, fetchProducts } = useProductsStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const { toggleFavorite, isFavorite, fetchFavorites } = useFavoritesStore();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(products);

  useEffect(() => {
    fetchProducts();
    fetchFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  useEffect(() => {
    setFiltered(filterProducts(products, query));
  }, [products, query]);

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
          style={{ flex: 1, fontSize: 16, paddingVertical: 8, color: "#222" }}
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
          renderItem={({ item }) => {
            const ratingInfo = ratings[item.id] || { avg: 0, count: 0 };
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductDetails", { product: item })
                }
              >
                <ProductCard
                  product={item}
                  avgRating={ratingInfo.avg}
                  reviewCount={ratingInfo.count}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                  onAddToCart={() => addToCart(item)}
                />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
