// components/auth/AuthGate.tsx
import React from "react";
import { View, Text } from "react-native";
import { useAuthContext } from "../../context/authContext";
import LandingPage from "@/app/index"; // Your landing/login page
import { router } from "expo-router";
import LoadingScreen from "../elements/loadingScreen";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
import { OpenSans_400Regular, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import {RobotoMono_400Regular } from '@expo-google-fonts/roboto-mono';
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { thisUser, isAuthChecking, isAuthRdy } = useAuthContext();


    const [fontsLoaded] = useFonts({

    Inter_400Regular,
    Inter_700Bold,
    OpenSans_400Regular,
    OpenSans_700Bold,
    RobotoMono_400Regular,
  });

  React.useEffect(() => {
    if (thisUser) {
      console.log("Ran router.replace to tabs");
      router.replace("/(tabs)/sessionManagerTab");
    }
  }, [thisUser]);

    if (!fontsLoaded) {
    return <LoadingScreen text="Loading app..." />;
  }

  if (!isAuthRdy) {
    console.log("Loading app");
    return <LoadingScreen text={"Loading app..."} />;
  } else if (isAuthChecking) {
    console.log("Checking creds");
    return <LoadingScreen text={"Checking credentials..."} />;
  } else {
    // Now that checking is done:
    if (!thisUser) {
      console.log("Showing landing page");
      return <LandingPage />;
    } else {
      return <>{children}</>;
    }
  }
};

export default AuthGate;
