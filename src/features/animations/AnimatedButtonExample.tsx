import React from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function AnimatedButtonExample() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => (scale.value = withSpring(0.95));
  const handlePressOut = () => (scale.value = withSpring(1));

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.View style={[animatedStyle]}>
        <Button
          mode="contained"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          Kliknij mnie
        </Button>
      </Animated.View>
    </View>
  );
}