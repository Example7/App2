import React, { useEffect, useRef } from "react";
import { View, Image, Animated } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1976d2",
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../../../assets/splash-icon.png")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text
          variant="headlineSmall"
          style={{
            color: "#fff",
            fontWeight: "700",
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          App2
        </Text>
      </Animated.View>

      <ActivityIndicator animating={true} color="#fff" size="large" />
    </View>
  );
}
