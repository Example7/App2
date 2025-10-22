import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function DraggableCardExample() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              backgroundColor: "#4caf50",
              borderRadius: 20,
            },
            animatedStyle,
          ]}
        />
      </GestureDetector>
    </View>
  );
}
