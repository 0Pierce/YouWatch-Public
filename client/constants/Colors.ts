const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

const Colors = {
  light: {
    text: "#000",
    background: "#fff",
    inputBackground: "#fff",
    inputBorderColor: "#2A2E45",
    placeHolderColor: "#000",
    btnBackground: "#000310",
    btnPressBackground: "#3A5378",
    btnTextColor: "#fff",
    waveBackground: "#000310",
    bordercolor: "#000000",

    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
    gradStart: "#a00000",
    gradEnd: "#ff0000",
    viewerItem: "#2A2E45",
  },
  dark: {
    text: "#fff",
    background: "#2A2E45",
    inputBackground: "#2A2E45",
    inputBorderColor: "#000310",
    placeHolderColor: "#CCCCCC",
    btnBackground: "#000310",
    btnPressBackground: "#3A4160",
    btnTextColor: "#fff",
    waveBackground: "#000",
    bordercolor: "#2A2E45",

    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,

    gradStart: "#500000",
    gradEnd: "#ff0000",
    viewerItem: "#2A2E45",
  },
};

export default Colors;
export type ThemeColors = typeof Colors.light;
