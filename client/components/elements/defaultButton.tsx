import { useThemeContext } from "@/context/themeContext";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TextStyle,
  ViewStyle,
  Pressable,
  StyleProp,
} from "react-native";
import DefaultText from "@/components/elements/defaultText";

//Props for button custimization otherwise use defaults
type ButtonProps = {
  text: string;
  txtStyle?: StyleProp<TextStyle>;
  btnStyle?: ViewStyle;
  btnPressStyle?: ViewStyle;
  onPress?: () => void;
};

export default function DefaultButton({
  text,
  txtStyle,
  btnStyle,
  btnPressStyle,
  onPress,
}: ButtonProps) {
  const { colors } = useThemeContext();
  // Define default button style with dynamic theme colors
  const dynamicStyle: ViewStyle = {
    backgroundColor: colors.btnBackground,
    borderColor: colors.bordercolor,

  };

  // Define pressed style with dynamic theme colors
  const dynamicPressStyle: ViewStyle = {
    backgroundColor: colors.btnPressBackground || "#ff1f1f", // Fallback to default if not provided
  };
  const dynamicTextStyle: TextStyle = {
    color: colors.btnTextColor,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        dynamicStyle,
        btnStyle,
        pressed && [styles.btnPress, dynamicPressStyle, btnPressStyle],
      ]}
    >
      {/* //NEXT DO THIS TEXT STYLE */}
      <DefaultText textStyle={[styles.text, dynamicTextStyle, txtStyle]}>
        {text}
      </DefaultText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    borderRadius: 10,
    minWidth: 100,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,

    //IOS

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    // Android shadow
    elevation: 5,
  },

  btnPress: {},

  text: {},
});
