import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider } from "../context/authContext";
import { SessionProvider } from "../context/sessionContext";
import { ThemeProvider } from "@/context/themeContext";
import AuthGate from "@/components/auth/authGate";
import { UserProvider } from "@/context/userContext";

export default function RootLayoutNav() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />

              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </AuthGate>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
