import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export const TapRotateScaleBox = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const tap = Gesture.Tap().onStart(() => {
    rotation.value = withTiming((rotation.value + 360) % 360, {
      duration: 600,
    });

    scale.value = withSpring(1.4, { damping: 8, stiffness: 150 }, () => {
      scale.value = withSpring(1);
    });
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: "center", marginTop: 80 }}>
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[
            {
              width: 100,
              height: 100,
              backgroundColor: "#4caf50",
              borderRadius: 16,
            },
            style,
          ]}
        />
      </GestureDetector>
    </View>
  );
};
