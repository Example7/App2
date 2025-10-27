import React from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

interface LoadingViewProps {
  message?: string;
}

export default function LoadingView({ message }: LoadingViewProps) {
  const { t } = useTranslation();

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
      <Text style={{ marginTop: 10, color: "#555" }}>
        {message || t("common.loading")}
      </Text>
    </View>
  );
}
