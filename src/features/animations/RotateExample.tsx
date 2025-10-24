import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Button } from "react-native-paper";

export default function RotateExample() {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        style={[
          {
            width: 120,
            height: 120,
            backgroundColor: "#2196f3",
            borderRadius: 20,
            marginBottom: 20,
          },
          animatedStyle,
        ]}
      />
      <Button
        mode="contained"
        onPress={() => (rotation.value = withSpring(rotation.value + 90))}
      >
        Obróć
      </Button>
    </View>
  );
}
