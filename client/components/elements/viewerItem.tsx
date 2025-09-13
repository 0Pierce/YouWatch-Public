import React, { useState } from "react";
import DefaultText, { normalize } from "@/components/elements/defaultText";
import { View, StyleSheet, Pressable } from "react-native";
import DefaultButton from "./defaultButton";
import { useSessionContext } from "@/context/sessionContext";
import { useAuthContext } from "@/context/authContext";
import GearIcon from "../svg/gear";
import CancelIcon from "../svg/cancelIcon";
import { useThemeContext } from "@/context/themeContext";

type ViewerItemProps = {
  username: string;
  role: string;
  togglePerm: (username: string) => void;
  isHost: boolean;
};

export default function ViewerItem({
  username,
  role,
  togglePerm,
  isHost,
}: ViewerItemProps) {
  const sessionContext = useSessionContext();
  const authContext = useAuthContext();

  const kick = () => {
    sessionContext.kickUser(username);
  };

  const [toggleActions, setToggleActions] = useState(false);
  const {colors} = useThemeContext()

  return (
    <View style={[styles.outsideContainer,{backgroundColor:colors.viewerItem}]}>
      <View style={styles.insideContainer}>
        <View style={styles.containerSplit}>
          <DefaultText textStyle={styles.text}>{`${username}:`}</DefaultText>
          <DefaultText textStyle={styles.text}>{role}</DefaultText>
        </View>

        {isHost ? (
          <>
            {toggleActions ? (
              <>
                <View style={styles.containerSplit}>
                  <>
                    <DefaultButton
                      btnStyle={styles.buttton}
                      txtStyle={styles.butttonTxt}
                      text="Kick"
                      onPress={kick}
                    ></DefaultButton>
                    <DefaultButton
                      btnStyle={styles.buttton}
                      txtStyle={styles.butttonTxt}
                      text={role === "Viewer" ? "Promote" : "Demote"}
                      onPress={() => togglePerm(username)}
                    ></DefaultButton>
                    <Pressable
                      style={styles.gearSvgInside}
                      onPress={() => setToggleActions((prev) => !prev)}
                    >
                      {/* <GearIcon width={28} height={28} fill={"#000"} /> */}
                      <CancelIcon width={normalize(24)} height={normalize(24)} fill={"#868686"}/>
                    </Pressable>
                  </>
                </View>
              </>
            ) : (
              <>
                {authContext.thisUser?.userName === username ? null : (
                  <>
                    
                    <Pressable
                      style={styles.gearSvgOutside}
                      onPress={() => setToggleActions((prev) => !prev)}
                    >
                      <GearIcon width={normalize(20)} height={normalize(20)} fill={"#868686"} />
                    </Pressable>
                  </>
                )}
              </>
            )}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outsideContainer: {
    position:"relative",
    // backgroundColor: "#2A2E45",
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: normalize(6),
    margin:normalize(3)
  },
  insideContainer: {
    position:"relative",
    width: "95%",
    // backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center",
    minHeight: normalize(30),
  },

  text: {
    fontSize: normalize(12),
    marginLeft: normalize(8),
    color:"white"
  },
  buttton: {
    padding: 6,
    paddingHorizontal: 10,
    minWidth: 0,
  },
  butttonTxt: {
    fontSize: normalize(12),
  },

  containerSplit: {
    // backgroundColor: "blue",
    position:"relative",
    flex: 1,
    height: "100%",
    flexDirection: "row",
    // borderColor: "black",
    // borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  gearSvgInside: {
    // backgroundColor: "yellow",
  },
  gearSvgOutside: {
    position:"absolute",
    right:5,
  },
});
