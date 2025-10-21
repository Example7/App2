import React from "react";
import { View } from "react-native";
import { IconButton, Badge } from "react-native-paper";
import { useCartStore } from "../store/useCartStore";
import { useNavigation } from "@react-navigation/native";

export default function CartIconWithBadge() {
  const navigation = useNavigation();
  const count = useCartStore((s) => s.getCount());

  return (
    <View>
      <IconButton
        icon="cart"
        size={28}
        onPress={() => navigation.navigate("Cart" as never)}
      />
      {count > 0 && (
        <Badge
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            backgroundColor: "#f44336",
          }}
        >
          {count}
        </Badge>
      )}
    </View>
  );
}
