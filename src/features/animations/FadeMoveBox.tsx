import React, { useEffect } from "react";
import { View, Button } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export const FadeMoveBox = () => {
  const opacity = useSharedValue(0);
  const offset = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));

  return (
    <View style={{ alignItems: "center", marginTop: 60 }}>
      <Animated.View
        style={[
          {
            width: 100,
            height: 100,
            backgroundColor: "#1976d2",
            borderRadius: 12,
          },
          animatedStyle,
        ]}
      />
      <Button
        title="Przesuń"
        onPress={() => {
          offset.value = withTiming(offset.value === 0 ? 150 : 0, {
            duration: 800,
          });
        }}
      />
    </View>
  );
};
