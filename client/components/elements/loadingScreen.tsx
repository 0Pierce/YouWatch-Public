import React from "react";
import DefaultView from "./defaultView";
import DefaultText from "@/components/elements/defaultText";
import { Image } from "react-native";

type LoadingScreenProps = {
  text: string;
};

export default function LoadingScreen({ text }: LoadingScreenProps) {
  return (
    <DefaultView
      viewStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Image
        source={require("../../assets/images/youWatchLogo.png")}
        style={{ width: 100, height: 100 }} // add dimensions, React Native requires them
      />
      <DefaultText>{text}</DefaultText>
    </DefaultView>
  );
}
