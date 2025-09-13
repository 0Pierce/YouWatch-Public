import { useThemeContext } from "@/context/themeContext";
import React from "react";
import {
  TextInput,
  ViewStyle,
  StyleSheet,
  TextStyle,
  TextInputProps,
  Platform,
} from "react-native";

type DefaultInputProps = TextInputProps & {
  textStyle?: TextStyle;
};

export default function DefaultInput({
  textStyle,
  ...props
}: DefaultInputProps) {
  const { colors } = useThemeContext();

  const dynamicStyle: TextStyle = {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorderColor,
   
    color: colors.text,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    paddingHorizontal: 10,
    fontSize: 16,
    ...Platform.select({
      ios: {
        borderRadius: 10,
      },
      android: {
        borderRadius: 8,
      },
    }),
  };

  return (
    <TextInput
      placeholderTextColor={colors.placeHolderColor}
      {...props}
      style={[styles.inputStyle, dynamicStyle, textStyle]}
    />
  );
}

const styles = StyleSheet.create({
  inputStyle: {
    position: "relative",
    margin: 5,
    minWidth: 150,
    zIndex: 10,
    fontFamily: Platform.select({
      ios: "System",
      android: "RobotoMono_400Regular",
    }),

    borderWidth:1.5
  },
});
