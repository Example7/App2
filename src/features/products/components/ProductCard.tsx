import React from "react";
import { View } from "react-native";
import { Card, Text, Button, IconButton } from "react-native-paper";
import { Product } from "../../../types/models";

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 14,
        backgroundColor: "#fff",
        elevation: 3,
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
          <Text style={{ color: "#777" }}>Brak zdjęcia</Text>
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

        {product.description && (
          <Text
            numberOfLines={2}
            style={{
              color: "#666",
              fontSize: 14,
              marginBottom: 8,
            }}
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
          <Text
            style={{
              fontWeight: "700",
              fontSize: 18,
              color: "#2196f3",
            }}
          >
            {product.price.toFixed(2)} zł
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
              Dodaj do koszyka
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
