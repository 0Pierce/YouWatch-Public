import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import User from "../../models/user";
import { useAuthContext } from "../../context/authContext";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import DefaultView from "../elements/defaultView";
import DefaultText, { normalize } from "@/components/elements/defaultText";
import DefaultInput from "../elements/defaultInput";
import DefaultButton from "../elements/defaultButton";

export default function Register({ switchForm }: { switchForm: () => void }) {
  const authContext = useAuthContext();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const register = () => {
    //Introduce password hashing later
    if (username && email && pass) {
      const newUser: User = new User("", username, email, pass);
      authContext.register(newUser);
    } else {
      Alert.alert("Missing inputs");
    }
  };

    const googleAuth =() =>{
      authContext.googleAuth()

  }

  return (
    <View style={styles.regContainer}>
      <DefaultText textStyle={styles.text}>Create an account</DefaultText>
      <DefaultInput
        textStyle={styles.input}
        placeholder="Username"
        style={styles.input}
        onChangeText={setUsername}
      ></DefaultInput>
      <DefaultInput
        textStyle={styles.input}
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
      ></DefaultInput>
      <DefaultInput
        textStyle={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        style={styles.input}
        onChangeText={setPass}
      ></DefaultInput>
      <View style={styles.optionsView}>
        <DefaultButton
          text="Register"
          onPress={register}
          btnStyle={styles.button}
        />
        <DefaultText textStyle={styles.formText} onPress={switchForm}>
          Sign In
        </DefaultText>
      </View>
      <DefaultButton
        btnStyle={styles.googleBtn}
        text="Continue with Google"
        onPress={googleAuth}
      ></DefaultButton>
    </View>
  );
}
const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  regContainer: {
    position: "relative",
    flex: normalize(0.6),
    alignItems: "center",
    width: "90%",
    marginTop:
      Platform.OS === "android" ? screenHeight * 0.05 : screenHeight * 0.07,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    zIndex: 2,
    //  backgroundColor:'red'
  },

  input: {
    width: "80%",
    maxWidth: normalize(350),
    paddingVertical: Platform.OS === "ios" ? normalize(12) : normalize(8),
    paddingHorizontal: normalize(10),
    fontSize: normalize(16),
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },

  formText: {
    textDecorationLine: "underline",
    margin: normalize(10),
    fontSize: normalize(16),
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
    
  },

  button: {
    width: "40%",
    height: normalize(45),
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  text: {
    marginBottom: normalize(15),
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    fontSize: normalize(16),
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
    }),
  },

  optionsView: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 10,
  },
  googleBtn: {
    minWidth: normalize(200),
    maxWidth: normalize(400),
  },
});
