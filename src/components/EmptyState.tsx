import React from "react";
import { View } from "react-native";
import { Text, IconButton } from "react-native-paper";

interface EmptyStateProps {
  icon?: string;
  message: string;
}

export default function EmptyState({
  icon = "information-outline",
  message,
}: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#f5f6fa",
      }}
    >
      <IconButton icon={icon} size={48} iconColor="#999" />
      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          color: "#666",
          marginTop: 8,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
