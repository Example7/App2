// import React from "react";
// import { Text } from "react-native";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";

// type Props = {
//   onPress: () => void;
//   label?: string;
// };

// export default function AnimatedAddToCartButton({
//   onPress,
//   label = "Dodaj do koszyka",
// }: Props) {
//   const scale = useSharedValue(1);
//   const color = useSharedValue("#4caf50");

//   const tapGesture = Gesture.Tap()
//     .onBegin(() => {
//       scale.value = withSpring(0.9);
//       color.value = "#388e3c";
//     })
//     .onEnd(() => {
//       scale.value = withSpring(1);
//       color.value = "#4caf50";
//       onPress();
//     });

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//     backgroundColor: color.value,
//   }));

//   return (
//     <GestureDetector gesture={tapGesture}>
//       <Animated.View
//         style={[
//           animatedStyle,
//           {
//             paddingVertical: 12,
//             borderRadius: 10,
//             alignItems: "center",
//             marginTop: 20,
//           },
//         ]}
//       >
//         <Text
//           style={{
//             color: "#fff",
//             fontWeight: "700",
//             fontSize: 16,
//           }}
//         >
//           {label}
//         </Text>
//       </Animated.View>
//     </GestureDetector>
//   );
// }
