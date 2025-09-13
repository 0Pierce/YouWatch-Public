import Button from "@/components/elements/defaultButton";
import DefaultInput from "@/components/elements/defaultInput";
import DefaultText, { normalize } from "@/components/elements/defaultText";
import DefaultView from "@/components/elements/defaultView";
import InputModal from "@/components/elements/inputModal";
import { useAuthContext } from "@/context/authContext";
import { useSessionContext } from "@/context/sessionContext";
import { useThemeContext } from "@/context/themeContext";
import { useUserContext } from "@/context/userContext";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, View, TextInput, Alert, Text, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

export default function ProfileTab() {
  const [vidId, setVidId] = useState("");
  const [rawID, setrawID] = useState("");
  const sessionContext = useSessionContext();
  const authContext = useAuthContext();
  const userContext = useUserContext();
  const [deleteAcc, setDeleteAcc] = useState(false);
  const [updatePass, setUpdatePass] = useState(false);
  const [updateUsername, setupdateUsername] = useState(false);

  const logOut = async () => {
    if (sessionContext.active) {
      await sessionContext.closeSession();
    }
    authContext.logout();
  };

  const themeContext = useThemeContext();

  const changeTheme = () => {
    themeContext.changeTheme();
  };

  const confirmDeletion = (input: string) => {
    Alert.alert("Are you sure?", "Delete account", [
      { text: "Cancel", onPress: () => console.log("Cancelled") },
      {
        text: "Confirm",
        onPress: () => {
          if (sessionContext.session) {
            Alert.alert("Leave your current session before deleting");
          } else {
            userContext.deleteAccount(input);
          }
        },
      },
    ]);
  };

  const confirmPassword = (oldPassword: string, newPassword?: string) => {
    if (newPassword) {
      userContext.changePassword(oldPassword, newPassword);
    } else {
      Alert.alert("No new Password");
    }
  };

  const confirmUsername = (username: string) => {
    userContext.changeUsername(username);
  };
  const { colors } = useThemeContext();
  return (
    <SafeAreaView style={styles.tabRoot} edges={["top", "left", "right"]}>
      <DefaultView viewStyle={styles.container}>
        <DefaultText textStyle={styles.titleText}>{`Welcome ${
          authContext.thisUser!.userName
        }`}</DefaultText>
        <View style={styles.topBtns}>
          <InputModal
            title="Delete account"
            placeholder="Password"
            onPress={confirmDeletion}
          />

          <Button text="Logout" onPress={logOut}></Button>
        </View>

        <View style={styles.topBtns}>
          <InputModal
            title="Update Password"
            placeholder="Password"
            twoInput={true}
            onPress={confirmPassword}
          />

          <InputModal
            title="Update Username"
            placeholder="New username"
            onPress={confirmUsername}
          />
        </View>
        <View style={styles.preferenceView}>
          <Button text="Change theme" onPress={changeTheme}></Button>
        </View>


      </DefaultView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabRoot: {
    position: "relative",
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    // backgroundColor:"red"
  },

  topBtns: {
    // backgroundColor: "#00ff40",
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: normalize(40),
  },
  titleText: {
    fontSize: normalize(28),
  },
  preferenceView: {
    marginTop: "auto",
    marginBottom: normalize(20),
    // backgroundColor:"red"
  },

});
