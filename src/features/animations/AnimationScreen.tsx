import React from "react";
import { ScrollView } from "react-native";
import { FadeMoveBox } from "./FadeMoveBox";
import { DraggableBox } from "./DraggableBox";
import { TapRotateScaleBox } from "./TapToRotateScaleBox";

export const AnimationsScreen = () => {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 40,
        alignItems: "center",
        gap: 40,
      }}
    >
      <FadeMoveBox />
      <DraggableBox />
      <TapRotateScaleBox />
    </ScrollView>
  );
};
