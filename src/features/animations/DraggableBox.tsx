import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export const DraggableBox = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((e) => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
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
              width: 100,
              height: 100,
              backgroundColor: "#ff7043",
              borderRadius: 16,
            },
            style,
          ]}
        />
      </GestureDetector>
    </View>
  );
};
