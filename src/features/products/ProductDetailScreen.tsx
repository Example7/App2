import React from "react";
import { View, ScrollView, Image } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useCartStore } from "../../store/useCartStore";
import { useFavoritesStore } from "../../store/useFavoritesStore";
import { useTranslation } from "react-i18next";
import AnimatedAddToCartButton from "../../components/AnimatedAddToCartButton";

export default function ProductDetailsScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { product } = route.params;
  const addToCart = useCartStore((s) => s.addToCart);
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const handleAddToCart = () => {
    addToCart(product);
    navigation.goBack();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <View style={{ padding: 16 }}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={{
              width: "100%",
              height: 280,
              borderRadius: 14,
              marginBottom: 16,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 280,
              backgroundColor: "#e0e0e0",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "#777" }}>{t("home.noImage")}</Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#222",
              flex: 1,
              marginRight: 10,
            }}
          >
            {product.name}
          </Text>

          <IconButton
            icon={isFavorite(product.id) ? "heart" : "heart-outline"}
            iconColor={isFavorite(product.id) ? "#e74c3c" : "#555"}
            size={26}
            onPress={() => toggleFavorite(product.id)}
          />
        </View>

        <Text style={{ fontSize: 18, color: "#2196f3", fontWeight: "700" }}>
          {product.price.toFixed(2)} zł
        </Text>

        <Text
          style={{
            marginTop: 16,
            fontSize: 15,
            lineHeight: 22,
            color: "#555",
          }}
        >
          {product.description ||
            t("home.noDescription", {
              defaultValue: "No additional information about this product.",
            })}
        </Text>

        <AnimatedAddToCartButton
          onPress={handleAddToCart}
          label={t("home.addToCart")}
        />

        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={{ marginTop: 12, alignSelf: "center" }}
        />
      </View>
    </ScrollView>
  );
}
