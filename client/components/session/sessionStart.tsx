import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  Switch,
} from "react-native";
import { Checkbox } from "react-native-paper";
import Button from "../elements/defaultButton";
import Session from "@/models/session";

import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import { useAuthContext } from "@/context/authContext";
import { useSessionContext } from "@/context/sessionContext";
import DefaultInput from "../elements/defaultInput";
import DefaultText, { normalize } from "@/components/elements/defaultText";
import DefaultButton from "../elements/defaultButton";
import DefaultView from "../elements/defaultView";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import Wave from "../svg/wave";
import { useThemeContext } from "@/context/themeContext";
import SessionList from "./sessionList";
import Wave2 from "../svg/wave2";
import { Image } from "react-native";

export default function SessionStart() {
  const [privateHost, setPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [sTitle, setSTitle] = useState("");
  const authContext = useAuthContext();
  const sessionContext = useSessionContext();
  const [mode, setMode] = useState(false);

  const host = () => {
    //Probably can be rewritten much better but am lazy rn
    if (sTitle) {
      if (privateHost) {
        if (password) {
          //host private
          const newSession = new Session(
            uuidv4(),
            sTitle,
            authContext.thisUser!.userName,
            authContext.thisUser!.id,
            password
          );
          try {
            sessionContext.createSession(newSession);
          } catch (error) {
            console.log("Session error: " + error);
            Alert.alert("Session creation error ");
          }
        } else {
          Alert.alert("Missing password");
        }
      } else {
        //Host public
        const newSession = new Session(
          uuidv4(),
          sTitle,
          authContext.thisUser!.userName,
          authContext.thisUser!.id
        );
        try {
          sessionContext.createSession(newSession);
        } catch (error) {
          console.log("Session creation error: " + error);
          Alert.alert("Session creation error ");
        }
      }
    } else {
      Alert.alert("Missing inputs");
    }
  };

  const join = () => {
    if (sTitle) {
      if (password) {
        sessionContext.joinSession(sTitle, password);
      } else {
        sessionContext.joinSession(sTitle);
      }
    } else {
      Alert.alert("Missing inputs" + " Put in a session title");
    }
  };
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const { colors } = useThemeContext();

  return (
    <View style={styles.container}>
      <View style={styles.titleView}>
        <MaskedView
          style={[styles.titleContainer, { height: 60 }]}
          maskElement={
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                // backgroundColor: "#ff0000",
              }}
            >
              <DefaultText
                textStyle={{
                  fontSize: normalize(40),
                  // fontWeight: "bold",
                  fontFamily: "Inter_700Bold",
                }}
              >
                YouWatch
              </DefaultText>
            </View>
          }
        >
          <LinearGradient
            colors={[colors.gradStart, colors.gradEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </MaskedView>
        <View style={styles.waveContainer}>
          <Wave fill={colors.waveBackground} />
        </View>
      </View>

      <View style={styles.sessionView}>
        {mode ? (
          //============= Host Container =============
          <View style={styles.hostContainer}>
            <DefaultText textStyle={styles.containerTitles}>
              Start a session:
            </DefaultText>
            <DefaultInput
              placeholder="Session Title"
              textStyle={styles.input}
              onChangeText={setSTitle}
            ></DefaultInput>

            <View style={styles.rowContainer}>
              <View style={styles.rowSwitch}>
                <Switch
                  value={privateHost}
                  onValueChange={() => setPrivate(!privateHost)}
                  trackColor={{ false: "#767577", true: "#d3d3d3" }}
                  thumbColor={privateHost ? colors.waveBackground : "#f4f3f4"}
                />
              </View>

              <View style={styles.rowContainerText}>
                {privateHost ? (
                  <DefaultInput
                    placeholder="Password"
                    textStyle={styles.input}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                  ></DefaultInput>
                ) : (
                  <DefaultText textStyle={styles.rowPrivateText}>
                    Add Password?
                  </DefaultText>
                )}
              </View>
            </View>

            <View style={styles.containerSwitch}>
              <DefaultButton
                text={mode ? "<~ Join a session" : "<~ Start a session"}
                onPress={() => {
                  setMode((prev) => !prev);
                }}
              ></DefaultButton>
              <DefaultButton
                txtStyle={styles.actionBtn}
                text="Start session"
                onPress={host}
              ></DefaultButton>
            </View>
          </View>
        ) : (
          //============= Join Container =============
          <View style={styles.joinContainer}>
            <DefaultText textStyle={styles.containerTitles}>
              Join a session:
            </DefaultText>
            <DefaultInput
              placeholder="Session Title"
              textStyle={styles.input}
              onChangeText={setSTitle}
            ></DefaultInput>
            <View style={styles.rowContainer}>
              <View style={styles.rowSwitch}>
                <Switch
                  value={privateHost}
                  onValueChange={() => setPrivate(!privateHost)}
                  trackColor={{ false: "#767577", true: "#d3d3d3" }}
                  thumbColor={privateHost ? colors.waveBackground : "#f4f3f4"}
                />
              </View>

              <View style={styles.rowContainerText}>
                {privateHost ? (
                  <DefaultInput
                    placeholder="Password"
                    textStyle={styles.input}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                  ></DefaultInput>
                ) : (
                  <DefaultText textStyle={styles.rowPrivateText}>
                    Private Session?
                  </DefaultText>
                )}
              </View>
            </View>

            <View style={styles.containerSwitch}>
              <DefaultButton
                text={mode ? "<~ Join a session" : "<~ Start a session"}
                onPress={() => {
                  setMode((prev) => !prev);
                }}
              ></DefaultButton>
              <DefaultButton
                txtStyle={styles.actionBtn}
                text="Join Session"
                onPress={join}
              ></DefaultButton>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.listView]}>
        <View
          style={[
            styles.listHolder,
            { backgroundColor: colors.waveBackground },
          ]}
        >
          <SessionList />
        </View>
      </View>
      <View style={[styles.wave2Style]}>
        <Wave2
          width={900}
          height={SCREEN_HEIGHT * (Platform.OS === "android" ? 0.35 : 0.35)}
          fill={colors.waveBackground}
        />
      </View>
    </View>
  );
}

const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "relative",
    // backgroundColor: "#70b3ffc0",
    alignItems: "center",
    zIndex: 1,
    flex: 1,
  },

  input: {
    // borderColor: "black",
    margin: 5,
    width: 150,
  },

  titleView: {
    height: normalize(80),
    // backgroundColor:"blue",
    width: "100%",
    zIndex: 1,
  },

  sessionView: {
    // backgroundColor: "blue",
    zIndex: 1,
    height: screenHeight * 0.45,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  listView: {
    position: "relative",
    alignItems: "center",
    width: "100%",
    // backgroundColor: "#ecec1a",
    // borderWidth: 5,
    // borderColor: "#ff00dd",
    zIndex: 1,
    // height: normalize(350),
    flex: 1,
  },

  listHolder: {
    position: "relative",

    height: normalize(250),
    width: "100%",
    flex: 1,
  },
  //65 - 70
  rowContainer: {
    flexDirection: "row",
    width: Platform.OS === "android" ? "65%" : "80%",

    alignItems: "center",
    // backgroundColor: "red",
  },

  rowContainerText: {
    position: "relative",
    // backgroundColor: "#eeff00",
    width: "60%",

    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  rowSwitch: {
    // backgroundColor: "pink",
    paddingRight: 5,
  },

  hostContainer: {
    // backgroundColor: "#ff0000",
    alignItems: "center",
    width: normalize(350),
    height: normalize(200),
  },

  joinContainer: {
    // backgroundColor: "rgba(0, 128, 0, 1)",
    alignItems: "center",
    width: normalize(350),
    height: normalize(200),
  },

  containerSwitch: {
    flexDirection: "row",
    marginTop: normalize(10),
  },

  containerTitles: {
    fontSize: normalize(20),
    fontWeight: "500",
    marginBottom: normalize(20),
  },
  waveContainer: {
    position: "absolute",
    top: normalize(-170),
    left: 0,
    zIndex: 0,
    // backgroundColor:'red'
  },

  titleContainer: {
    flex: 1,
    // backgroundColor:"yellow",
    flexDirection: "row",
    zIndex: 50,
    marginTop: Platform.OS === "android" ? normalize(2) : normalize(20),
  },

  wave2Style: {
    position: "absolute",
    bottom: Platform.OS === "android" ? normalize(170) : "18%",
    zIndex: 0,
    justifyContent: "center",
  },
  rowPrivateText: {
    fontSize: normalize(14),
  },
  actionBtn: {
    color: "#ffffff",

    fontFamily: "OpenSans_700Bold",
  },
});
