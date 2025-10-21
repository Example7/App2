import React from "react";
import { View } from "react-native";
import { Badge, Icon } from "react-native-paper";
import { useCartStore } from "../store";

export default function CartIconWithBadge() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View>
      <Icon source="cart-outline" size={24} />
      {total > 0 && (
        <Badge size={16} style={{ position: "absolute", top: -5, right: -10 }}>
          {total}
        </Badge>
      )}
    </View>
  );
}
