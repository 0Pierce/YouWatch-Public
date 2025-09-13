import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";
import { SessionProvider } from "../../context/sessionContext";
import Colors from "@/constants/Colors";
import { useThemeContext } from "@/context/themeContext";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colors } = useThemeContext();
  return (
    <SessionProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
          },
          tabBarActiveTintColor: "#ff0000", 
          tabBarInactiveTintColor: colors.text,
        }}
      >
        <Tabs.Screen
          name="sessionManagerTab"
          options={{
            title: "Session Manager",
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profileTab"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="archive" color={color} />
            ),
          }}
        />
      </Tabs>
    </SessionProvider>
  );
}
