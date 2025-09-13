import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

import SessionItem from "@/components/elements/sessionItem";
import { useEffect, useState } from "react";
import { useSessionContext } from "@/context/sessionContext";
import Button from "../elements/defaultButton";
import ActiveSession from "@/models/activeSession";
import { useThemeContext } from "@/context/themeContext";
import DefaultText, { normalize } from "@/components/elements/defaultText";
import DefaultButton from "../elements/defaultButton";
import Refresh from "../svg/refresh";

export default function SessionList() {
  const sessionContext = useSessionContext();
  const [sessionData, setSessionData] = useState<any[]>([]);
  //Need:
  //sTitle, password?
  //Hostname
  const { colors } = useThemeContext();
  useEffect(() => {
    updateSessionsList();
  }, []);

  const updateSessionsList = async () => {
    const data = await sessionContext.updateActiveSessionsList();
    console.log(data);
    setSessionData(data);
  };

  const rotation = useSharedValue(0);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  const handlePress = () => {
    rotation.value = 0; 
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 500,
        easing: Easing.linear,
      }),
      1, 
      false 
    );
    updateSessionsList();
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.listHeader}>
        <View style={styles.headerFrag}></View>
        <View style={styles.headerFrag}>
          <DefaultText textStyle={{ color: "white", fontSize:normalize(14) }}>
            Active Sessions
          </DefaultText>
        </View>
        <View style={styles.headerFrag}>
          <Pressable onPress={handlePress}>
            <Animated.View style={animatedStyle}>
              <Refresh width={24} height={24} fill={"#fff"} />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={sessionData}
        renderItem={({ item }) => (
          <SessionItem
            title={item.title}
            isPrivate={item.isPrivate}
            host={item.host}
          />
        )}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      ></FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",

    width: "100%",
    alignItems: "center",

    backgroundColor: "transparent",
    zIndex: 1,
  },

  flatList: {
    height: 175,
  },
  flatListContent: {
    // backgroundColor:"red",

    alignItems: "center",
  },
  listHeader: {
    // backgroundColor: "red",
    width: "100%",
    flexDirection: "row",
    marginBottom: normalize(10),
  },

  headerFrag: {
    flex: 1,
    // backgroundColor: "blue",
    // borderColor: "pink",
    // borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
