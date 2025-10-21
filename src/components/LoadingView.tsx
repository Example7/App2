import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

interface LoadingViewProps {
  message?: string;
}

export default function LoadingView({
  message = "Wczytywanie...",
}: LoadingViewProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f6fa",
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10, color: "#555" }}>{message}</Text>
    </View>
  );
}
