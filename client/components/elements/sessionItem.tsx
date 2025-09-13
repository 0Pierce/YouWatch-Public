import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ViewStyle,
  Platform,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSessionContext } from "@/context/sessionContext";
import { useState } from "react";
import DefaultText, { normalize } from "@/components/elements/defaultText";
import { useThemeContext } from "@/context/themeContext";
import DefaultInput from "./defaultInput";
import DefaultButton from "./defaultButton";
import { useAuthContext } from "@/context/authContext";

type sessionItemProps = {
  title: string;
  host: string;
  isPrivate: boolean;
};

export default function SessionItem({
  title,
  host,
  isPrivate,
}: sessionItemProps) {
  // shield-lock-open
  const sessionContext = useSessionContext();
  const authContext = useAuthContext()
  const [password, setPassword] = useState("");
  const [showPassInput, setShowPassInput] = useState(false);

  const join = () => {
    if (isPrivate) {
      if (password || (authContext.thisUser?.userName === host)) {
        try {

          sessionContext.joinSession(title, password);
        } catch (err) {
          Alert.alert("Error Joining ");
        }
      } else {
        Alert.alert("Input: ", "Missing password");
      }
    } else {
      //Join without password
      sessionContext.joinSession(title);
      console.log("Joining without pass");
    }
  };

  const passwordPop = () => {
    setShowPassInput(!showPassInput);
  };

  const { colors } = useThemeContext();

  const dynamicStyle: ViewStyle = {};

  //  <View style={[styles.box, isPressed ? styles.boxPressed : styles.boxUnpressed]}></View>
  return (
    <View style={[showPassInput ? styles.wideContainer : styles.container]}>
      
      {showPassInput ? null : (
        <View style={styles.left}>
          <DefaultText textStyle={styles.titleHeader}>{title}</DefaultText>
          <DefaultText
            textStyle={styles.hostHeader}
          >{`By: ${authContext.thisUser?.userName === host ? "You" : host}`}</DefaultText>
        </View>
      )}
     

      {showPassInput ? (
        <View style={styles.middle}>
          <DefaultInput
            textStyle={styles.input}
            placeholder="Password"
            onChangeText={setPassword}
          ></DefaultInput>
        </View>
      ) : (
        <View></View>
      )}

      <View style={styles.right}>
        {isPrivate ? (
          <DefaultButton
            text={showPassInput ? "Back" : "Enter Password"}
            onPress={passwordPop}
            btnStyle={styles.btnStyle}
          ></DefaultButton>
        ) : (
          <DefaultButton
            text="Join"
            onPress={join}
            btnStyle={styles.btnStyle}
          ></DefaultButton>
        )}

        {showPassInput ? (
          <DefaultButton text="Join" onPress={join} btnStyle={styles.btnStyle}></DefaultButton>
        ) : (
          <MaterialCommunityIcons
            name={isPrivate ? "shield-lock" : "shield-lock-open"}
            size={24}
            color={isPrivate ? "red" : "green"}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: normalize(300),
    height: 50,
    backgroundColor: "#b3c1ff00",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "white",
    margin: 5,
    overflow: "hidden",
  },

  wideContainer: {
    width: normalize(350),
    height: 50,
    // backgroundColor: "rgba(77, 110, 255, 1)",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: normalize(10),
    borderWidth: 1,
    borderColor: "white",
    margin: 5,
    overflow: "hidden",
  },

  right: {
    flexDirection: "row",
    // backgroundColor: "yellow",
    marginLeft: "auto",
    alignItems: "center",
  },
  left: {
    // backgroundColor: "green",
    marginRight: "auto",
  },
  middle: {
    // backgroundColor: "red",
    alignItems: "center",
    flex: 1,
  },

  input: {
    height: Platform.OS === "android" ? "70%" : "65%",
     minWidth: "90%",
     fontSize: Platform.OS === "ios" ? 12 : 12,
    // borderColor: "white",
    // borderWidth: 0.5,
    color: "white",
    textAlign: "center"
  },

  titleHeader: {
    fontWeight: "bold",
    fontSize: normalize(16),
    color: "white",
  },

  hostHeader: {
    fontSize: normalize(12),
    color: "white",
  },

  btnStyle: {
    borderColor: "white",
    borderWidth: 0.5,
  },
});
