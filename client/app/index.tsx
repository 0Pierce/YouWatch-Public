import React, { useState, useContext, Suspense } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import User from "../models/user";
import { useAuthContext } from "../context/authContext";
import LoginFrag from "../components/auth/login";
import RegisterFrag from "../components/auth/register";
import Button from "@/components/elements/defaultButton";
import { useThemeContext } from "@/context/themeContext";
import DefaultView from "@/components/elements/defaultView";
import DefaultText, { normalize } from "@/components/elements/defaultText";
import Auth from "@/components/auth/auth";
import LoadingScreen from "@/components/elements/loadingScreen";
import Wave from "@/components/svg/wave";
import SvgIcon from "@/components/svg/icon";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

export default function index() {
  const themeContext = useThemeContext();
  const authContext = useAuthContext();
  const insets = useSafeAreaInsets();

  // const changeTheme = () => {
  //   themeContext.changeTheme();
  // };

  if (authContext.thisUser) {
    console.log("skipping index -from 'index.tsx'");
    return <LoadingScreen text={"Checking credentials..."} />;
  }
  console.log(authContext.isAuthChecking);
  console.log("index.tsx");
  const { colors } = useThemeContext();

  return (
    <SafeAreaView
      style={[styles.indexRoot, { backgroundColor: "transparent" }]}
    >
      {/* Top safe area */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: "#000310",
        }}
      />

      {/* Bottom safe area */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: colors.background,
        }}
      />

      {/* Main content */}
      <DefaultView
        viewStyle={[
          styles.landingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.landingPromo}>
          <DefaultText textStyle={{ fontSize: normalize(20), zIndex: 2, color: "#fff" }}>
            Fast, Simple, Reliable.
          </DefaultText>



          <MaskedView
            style={{ flex: 0.5, flexDirection: "row", zIndex: 10 }}
            maskElement={
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  //  backgroundColor:"#00ff2a",
                  zIndex: 10,
                  flex:1
                }}
              >
                <DefaultText
                  textStyle={{
                    fontSize: Platform.OS === "android" ? normalize(40) : normalize(30),
                    fontWeight: "bold",
                    fontFamily: "System",
                    zIndex: 10,
                    
                    // backgroundColor:"red",
                  }}
                >
                  YouWatch
                </DefaultText>
              </View>
            }
          >
            <LinearGradient
              colors={["#a00000", "#ff0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </MaskedView>

          
        </View>

        <View style={styles.authContainer}>
          <Auth />
        </View>

        <View style={styles.wave}>
          <Wave width={normalize(600)} height={normalize(400)} fill={"#000310"} />
        </View>

        {/* <Button text="Change theme" onPress={changeTheme}></Button> */}
      </DefaultView>
    </SafeAreaView>
  );
}

const { height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  indexRoot: {
    position: "relative",
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  landingContainer: {
    position: "relative",
    flex: 1,
  },
  authContainer: {
    position: "relative",
    flex: 1,
  },
  landingPromo: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.4,
    zIndex: 2,
    // backgroundColor:"blue"

  },
  wave: {
    zIndex: 0,
    position: "absolute",
    top: 0,
  
  },
  icon: {
    // backgroundColor:'red',
    marginTop: screenHeight * 0.03,
  },
});
