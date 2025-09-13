import { useThemeContext } from "@/context/themeContext";
import React from "react";
import { TextStyle, Text, StyleSheet, TextProps, PixelRatio, Dimensions, StyleProp, Platform } from "react-native";
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

type defaultText = TextProps & {
  
  children: string;
  textStyle?: StyleProp<TextStyle>;

};


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Based on standard ~5" screen mobile device
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

export function normalize(size: number, based: 'width' | 'height' = 'width') {
  const scale = based === 'height' 
    ? SCREEN_HEIGHT / BASE_HEIGHT 
    : SCREEN_WIDTH / BASE_WIDTH;

  const newSize = size * scale;

  // iOS renders text slightly smaller — boost it a bit
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
export default function defaultText({ textStyle, children, ...props }: defaultText) {



  const { colors } = useThemeContext();
  const dynamicStyle: TextStyle = {
    color: colors.text

  
  };

  

  return (
    <Text allowFontScaling={true} {...props} style={[styles.textStyle, dynamicStyle, textStyle]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  textStyle: { 
    fontFamily: 'OpenSans_400Regular', 
    fontSize: normalize(12),
  },
});
