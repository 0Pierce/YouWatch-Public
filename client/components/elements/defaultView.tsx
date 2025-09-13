import { useThemeContext } from "@/context/themeContext";
import React, { ReactNode } from "react";
import { ViewStyle, StyleSheet, View, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type DefaultViewProps = {
  viewStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export default function DefaultView({ viewStyle, children }: DefaultViewProps) {
  const themeContext = useThemeContext();

  const { colors } = useThemeContext();
  const dynamicStyle: ViewStyle = {
    backgroundColor: colors.background,
  };

  return (
    <View style={[dynamicStyle, styles.defaultView, viewStyle]}>
      {children}
    </View>


  );
}

const styles = StyleSheet.create({
  defaultView: {
     position:"relative",
    width: "100%",
  },


});
