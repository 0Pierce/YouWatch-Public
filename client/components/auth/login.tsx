import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import User from "../../models/user";
import { useAuthContext } from "../../context/authContext";
import { useState } from "react";

import DefaultView from "../elements/defaultView";
import DefaultButton from "../elements/defaultButton";
import DefaultInput from "../elements/defaultInput";
import DefaultText, { normalize } from "../elements/defaultText";
import { GoogleAuthProvider } from "firebase/auth";

export default function Login({ switchForm }: { switchForm: () => void }) {
  const authContext = useAuthContext();
  const [identifier, setIdentifier] = useState("");
  const [pass, setPass] = useState("");

  const login = () => {
    //Calls the _layout login function with the paramters

    if (identifier && pass) {
      authContext.login(identifier, pass);
    } else {
      Alert.alert("Missing inputs", " Missing User or pass");
    }
  };


  const googleAuth =() =>{
    authContext.googleAuth()

  }

  //DELETE LATER
  //A login skip for fast access
  const loginSkip = () => {
    authContext.login("piercepokorny.03@gmail.com", "Pierce0303");
  };
  const loginSkip1 = () => {
    authContext.login("0pierce.dev@gmail.com", "jeffjeff");
  };

  return (
    <View style={styles.loginContainer}>
      <DefaultText textStyle={styles.text}>Sign In</DefaultText>
      <DefaultInput
        textStyle={styles.input}
        placeholder="Email"
        onChangeText={setIdentifier}
      ></DefaultInput>
      <DefaultInput
        textStyle={styles.input}
        placeholder="Password"
        onChangeText={setPass}
        secureTextEntry={true}
      ></DefaultInput>

      <View style={styles.optionsView}>
        <DefaultButton
          btnStyle={styles.button}
          text="Login"
          onPress={login}
        ></DefaultButton>
        <DefaultText textStyle={styles.formText} onPress={switchForm}>
          Create account
        </DefaultText>
      </View>

      <DefaultButton
          btnStyle={styles.googleBtn}
          text="Sign In with Google"
          onPress={googleAuth}
        ></DefaultButton>

      {/* <DefaultButton text="skip Pie" onPress={loginSkip}></DefaultButton> */}
      {/* <DefaultButton btnStyle={styles.button} text="skip Jeff" onPress={loginSkip1}></DefaultButton>  */}
    </View>
  );
}

const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  loginContainer: {
    position: "relative",
    flex: normalize(0.6),
    alignItems: "center",
    width: "90%",
    marginTop:
      Platform.OS === "android" ? normalize(screenHeight * 0.05) : normalize(screenHeight * 0.07),
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    zIndex: 2,
    // backgroundColor:'red'
  },

  formText: {
    position: "relative",
    textDecorationLine: "underline",
    margin: normalize(10),
    fontSize: normalize(16),
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
    zIndex: 2,
  },

  input: {
    position: "relative",
    width: "80%",
    maxWidth: normalize(350),
    paddingVertical: Platform.OS === "ios" ? normalize(12) : normalize(8),
    paddingHorizontal: normalize(10),
    fontSize: normalize(16),
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
    zIndex: 2,
  },

  button: {
    position: "relative",
    width: "40%",
    height: normalize(45), 
    margin: normalize(10),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    zIndex: 2,
  },

  text: {
    position: "relative",
    marginBottom: 15,
    fontSize: normalize(16),
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
    zIndex: 2,
  },

  optionsView: {
    position: "relative",
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 10, // Only supported in RN >= 0.71
    zIndex: 2,
  },
  googleBtn: {
    minWidth: normalize(200),
    maxWidth: normalize(400),
  },
});
