import {
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import Button from "@/components/elements/defaultButton";
import { useAuthContext } from "@/context/authContext";
import YoutubePlayer from "react-native-youtube-iframe";
import { useCallback, useState } from "react";
import { WebView } from "react-native-webview";

import { useSessionContext } from "@/context/sessionContext";
import Session from "@/models/session";
import { v4 as uuidv4 } from "uuid";

import VideoFrag from "@/components/session/videoPlayer";
import SessionFrag from "@/components/session/sessionStart";
import SessionList from "@/components/session/sessionList";
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultView from "@/components/elements/defaultView";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import Wave from "@/components/svg/wave";
import { useThemeContext } from "@/context/themeContext";
import Wave2 from "@/components/svg/wave2";
import DefaultText from "@/components/elements/defaultText";

export default function TabOneScreen() {
  const authContext = useAuthContext();
  const sessionContext = useSessionContext();

  const themeContext = useThemeContext();
  const { colors } = useThemeContext();

  const changeTheme = () => {
    themeContext.changeTheme();
  };

  return (
    <SafeAreaView style={styles.tabRoot} edges={["top", "left", "right"]}>
      <DefaultView viewStyle={styles.tabRoot}>
        {sessionContext.active ? <VideoFrag /> : <SessionFrag />}
      </DefaultView>
    </SafeAreaView>
  );
}

const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  tabRoot: {
    position: "relative",
    flex: 1,

    width: "100%",
  },


  // sessionView: {
  //   position: "relative",
  //   width: "100%",
  //   zIndex: 1,
  //   // marginTop: Platform.OS === "android" ? screenHeight*0.1 : screenHeight * 0.13,
  //   backgroundColor:"red",
  //   flex:1,

  // },
});
