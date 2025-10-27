import React from "react";
import { View } from "react-native";
import { Card, Text, Button, IconButton } from "react-native-paper";
import { Product } from "../../../types/models";
import { useTranslation } from "react-i18next";
import { renderStars, formatStarsLabel, formatPrice } from "../../../lib";
import { ProductCardProps } from "../../../types/models";

export default function ProductCard({
  product,
  avgRating = 0,
  reviewCount = 0,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 14,
        backgroundColor: "#fff",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: "hidden",
      }}
    >
      {product.image_url ? (
        <Card.Cover
          source={{ uri: product.image_url }}
          style={{
            height: 220,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        />
      ) : (
        <View
          style={{
            height: 220,
            backgroundColor: "#e0e0e0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#777" }}>{t("home.noImage")}</Text>
        </View>
      )}

      {onToggleFavorite && (
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 50,
            zIndex: 2,
          }}
        >
          <IconButton
            icon={isFavorite ? "heart" : "heart-outline"}
            iconColor={isFavorite ? "#e74c3c" : "#666"}
            size={24}
            onPress={onToggleFavorite}
          />
        </View>
      )}

      <Card.Content style={{ padding: 14 }}>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 18,
            marginBottom: 6,
            color: "#222",
          }}
        >
          {product.name}
        </Text>

        {reviewCount > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            {renderStars(avgRating)}
            <Text style={{ color: "#666", marginLeft: 6 }}>
              {formatStarsLabel(avgRating, reviewCount)}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: "#999",
              fontStyle: "italic",
              marginBottom: 6,
            }}
          >
            {t("reviews.noReviews")}
          </Text>
        )}

        {product.description && (
          <Text
            numberOfLines={2}
            style={{ color: "#666", fontSize: 14, marginBottom: 8 }}
          >
            {product.description}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 18, color: "#2196f3" }}>
            {formatPrice(product.price)}
          </Text>

          {onAddToCart && (
            <Button
              mode="contained"
              onPress={onAddToCart}
              style={{
                borderRadius: 8,
                backgroundColor: "#4caf50",
              }}
              labelStyle={{
                fontSize: 14,
                fontWeight: "600",
                color: "#fff",
              }}
            >
              {t("home.addToCart")}
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
