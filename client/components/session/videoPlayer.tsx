/*====================================================================
Name: videoPlayer

Description: 
Contains logic pertaining to videoPlayer sync data to and from the sessionContext (database). 
Ensures data is passed and recieved correctly

//====================================================================*/

import Button from "@/components/elements/defaultButton";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Alert,
  Text,
  Dimensions,
  ScrollView,
  AppState,
  AppStateStatus,
} from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import { useSessionContext } from "@/context/sessionContext";
import { useAuthContext } from "@/context/authContext";
import VideoState from "../../models/videoState";
import Session from "@/models/session";
import ActiveSession from "@/models/activeSession";
import DefaultInput from "../elements/defaultInput";
import DefaultText, { normalize } from "../elements/defaultText";
import DefaultButton from "@/components/elements/defaultButton";
import ViewerItem from "../elements/viewerItem";
import LoadingScreen from "../elements/loadingScreen";
import { useThemeContext } from "@/context/themeContext";
import { StatusBar } from "react-native";

export default function VideoPlayer() {
  console.log("Ran videoPlayer");

  //====Session state====
  const [rawID, setrawID] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videoState, setVideoState] = useState<VideoState | undefined>(
    undefined
  );
  const [userTypeFlag, setUserTypeFlag] = useState(true);
  const [needSeek, setNeedSeek] = useState(false);
  //====================

  //====Video state==== - Used for getting local changes and updating DB
  const [vidID, setVidId] = useState("");
  const [timeStamp, setTimeStamp] = useState<number | undefined>(0);
  const [playerState, setPlayerState] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [play, setPlay] = useState(false); //Based on player state from database
  //===================

  //======Contexts & refs======
  const sessionContext = useSessionContext();
  const authContext = useAuthContext();

  const playerRef = useRef<YoutubeIframeRef>(null);
  const screenWidth = Dimensions.get("window").width;
  //====================

  const wasUnstarted = useRef(true);
  const sinceJoinTimer = useRef<number | null>(null);
  const sinceJoin = useRef(0);
  const rawState = useRef("unstarted");



  //========================================================================
  //Managed app state - Change role of users to "Inactive" (Not implemented yet)
  //========================================================================
  const appState = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log("AppState changed:", nextAppState);

    if (
      appState.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      console.log("App moved to background or inactive");
      // Save video state to DB or notify session context
      const saveState = async () => {
        const currTime = await playerRef.current?.getCurrentTime();
        sessionContext.writeSession({
          timeStamp: Math.round(currTime! * 100) / 100,
          state: rawState.current,
        });
      };
      saveState();
    }

    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App moved to foreground");
      // Optionally refresh video state from DB
    }

    appState.current = nextAppState;
  };

  //========================================================================
  //Determine if user is host or viewer for conditional rendering
  //========================================================================
  useEffect(() => {
    if (userTypeFlag) {
      if (sessionContext.session) {
        //Loads the current video

        console.log("=====CHECKING USER TYPE=====");

        if (
          authContext.thisUser?.userName === sessionContext.session?.hostName
        ) {
          console.log("You are the host");
          setIsHost(true);
          setIsAdmin(true);
        } else {
          console.log("You are a viewer");
          setIsHost(false);
          setIsAdmin(false);
        }
        console.log(
          "Session has active video??: " +
            authContext.thisUser?.userName +
            " - " +
            sessionContext.session.videoID
        );
        if (sessionContext.session.videoID) {
          console.log("Session has active video");
          console.log(
            "Session has active video: " + sessionContext.session.videoID
          );
          setVidId(sessionContext.session.videoID);

          if (sessionContext.session.videoState?.state === "playing") {
            console.log("VIDEO IS ALREADY PLAYING");

            setPlay(true);
          }

          setNeedSeek(true);
        }
        setUserTypeFlag(false);
      } else {
        setUserTypeFlag(true);
        console.log("Loading session");
      }
    }
  }, [sessionContext.session]);

  //DEBUGGING
  //   useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const currTime = await playerRef.current?.getCurrentTime();
  //     console.log(`${authContext.thisUser?.userName} is at: ${Math.round(currTime!*100)/100}`)
  //     // console.log(`ID?: ${sessionContext.session?.videoID} for ${authContext.thisUser?.userName}`)
  //     // console.log(`session?: ${sessionContext.session?.toString()} for ${authContext.thisUser?.userName}`)
  //   }, 1000);

  //   // Clean up on unmount
  //   return () => clearInterval(interval);
  // }, []);

  //========================================================================
  //Updates vid ID from DB
  //========================================================================
  useEffect(() => {
    console.log(sessionContext.session?.toString());
    console.log(
      `vidUseEffect id: ${sessionContext.session?.videoID} for: ${authContext.thisUser?.userName}`
    );
    const newID = sessionContext.session?.videoID;
    if (newID) {
      console.log(
        `vidUseEffect ${newID} for: ${authContext.thisUser?.userName}`
      );
      setVidId((prev) => {
        if (prev !== newID) {
          return newID;
        }
        return prev;
      });
    }
  }, [sessionContext.session?.videoID]);

  // ========================================================================
  // Keep track of player state updates from DB - Updates on state change
  // ========================================================================

  useEffect(() => {
    const newState = sessionContext.session?.videoState?.state;
    if (newState && isReady) {
      if (newState === "playing") {
        if (sessionContext.session?.videoState?.timeStamp) {
          playerRef.current?.seekTo(
            sessionContext.session?.videoState?.timeStamp,
            true
          );
        }

        setPlay(true);
        setPlayerState("playing");
      } else if (newState === "paused") {
        if (sessionContext.session?.videoState?.timeStamp) {
          playerRef.current?.seekTo(
            sessionContext.session?.videoState?.timeStamp,
            true
          );
        }

        setPlay(false);
        setPlayerState("paused");
      }
    }
  }, [sessionContext.session?.videoState?.state]);

  //========================================================================
  //Updates the local timestamp from DB
  //========================================================================
  useEffect(() => {
    const timestamp = sessionContext.session?.videoState?.timeStamp;
    const state = sessionContext.session?.videoState?.state;

    if ((state === "playing" || state === "paused") && timestamp) {
      console.log("timestamp effect");
      console.log("State: " + playerState);
      playerRef.current?.seekTo(timestamp, true);
    }
  }, [sessionContext.session?.videoState?.timeStamp]);

  //========================================================================
  //Updates the local playrate from DB and kicks user out of session if its closed
  //========================================================================
  useEffect(() => {
    const newRate = sessionContext.session?.videoState?.playRate;
    if (newRate === -1) {
      sessionContext.leaveSession();
      Alert.alert("Session Closed");
    } else if (newRate && newRate > 0) {
      setPlaybackRate(newRate);
    }
  }, [sessionContext.session?.videoState?.playRate]);

  //========================================================================
  //Function to upload the new state
  //========================================================================
  const handleStateChange = async (state: string) => {
    //detect disruptions at start of video playing
    // if (wasUnstarted.current) {
    //   syncVideoStart();
    // }

    rawState.current = state;
    if (
      (state === "playing" || state === "paused") &&
      state !== sessionContext.session?.videoState?.state
    ) {
      console.log(
        `Last state update: ${sessionContext.session?.videoState?.lastUpdated} for ${authContext.thisUser?.userName}`
      );
      console.log("local state: " + state);

      const currTime = await playerRef.current?.getCurrentTime();
      const dbTime = sessionContext.session?.videoState?.timeStamp;

      if (state === "paused" || state === "playing") {
        if (dbTime === undefined) {
          sessionContext.writeSession({
            timeStamp: 0,
            state: state,
          });
        } else {
          sessionContext.writeSession({
            timeStamp: Math.round(currTime! * 100) / 100,
            state: state,
          });
        }

        console.log(
          `handled state change: ${authContext.thisUser?.userName}, ${state} `
        );

        //TODO: Anything here to optimize state sync?
        setPlayerState(state);
      }

      // }else if(needSeek && state === ){

      // }
    } else {
      if (
        state === "playing" &&
        sessionContext.session?.videoState?.state === "playing"
      ) {
        const currTime = await playerRef.current?.getCurrentTime();
        const dbTime = sessionContext.session?.videoState?.timeStamp ?? 0;
        const timeDiff = Math.abs(currTime! - dbTime);
        if (timeDiff > 2) {
          console.log(sessionContext.session?.videoState?.state);
          console.log("Likely drag - writing timestamp");
          sessionContext.writeSession({
            timeStamp: Math.round(currTime! * 100) / 100,
          });
        }
      }

      console.log(
        `unique local state : ${state} for ${authContext.thisUser?.userName}`
      );

      if (needSeek && state === "playing") {
        console.log("NEED SEEK RAN");
        playerRef.current?.seekTo(
          sessionContext.session?.videoState?.timeStamp!,
          true
        );
        setNeedSeek(false);
      }
    }
  };

  //========================================================================
  //Function to upload the new rate
  //========================================================================
  const handleRateChange = (playRate: number) => {
    sessionContext.writeSession({ playRate: playRate });
  };

  const stopHost = () => {
    sessionContext.closeSession();
  };

  const leaveSession = () => {
    sessionContext.leaveSession();
  };
  const tempPlayBtn = () => {
    setPlay((prev) => !prev);
  };

  const askPermissions = () => {
    //Add response logic from the host later
    //TODO: Let host assign admin to viewers
    //Right now leave as toggle for testing
    setIsAdmin(!isAdmin);
  };

  const syncVideoStart = async () => {
    console.log("===================SYNCVIDEOSTART===================");
    const currTime = await playerRef.current?.getCurrentTime();
    const dbTime = sessionContext.session?.videoState?.timeStamp;

    if (!sinceJoinTimer.current) {
      sinceJoinTimer.current = setInterval(async () => {
        console.log(`Since join: ${(sinceJoin.current += 1)}`);
        sinceJoin.current += 1;
        const currTime2 = await playerRef.current?.getCurrentTime();
        console.log(`Current time: ${currTime2}`);
      }, 1000);
    }

    console.log(`===========RAW STATE ${rawState.current}======`);
    console.log(`===========DECIMAL COUNT: ${countDecimals(currTime!)}======`);
    if (countDecimals(currTime!) > 5) {
      console.log(
        "=======================AD has ENDED========================"
      );
      wasUnstarted.current = false;
      clearInterval(sinceJoinTimer.current);
    } else if (
      countDecimals(currTime!) <= 6 &&
      rawState.current !== "video cued" &&
      rawState.current !== "buffering"
    ) {
      console.log("==========================AD detected====================");
    }
  };

  const countDecimals = (number: number) => {
    if (Math.floor(number) === number) {
      return 0;
    }

    const decimals = number.toString().split(".");
    return decimals.length > 1 ? decimals[1].length : 0;
  };

  //========================================================================
  //Allows users to enter youtube links and extracts their IDs
  //========================================================================
  const findVid = () => {
    if (rawID) {
      const extract = rawID.match(
        /(?:youtu\.be\/|youtube\.com\/.*[?&]v=)?([a-zA-Z0-9_-]{11})(?:[&?]|$)/
      );

      const id = extract ? extract[1] : "empty";

      if (id && isReady) {
        setVidId(id);
        sessionContext.writeSession(undefined, id);
      } else {
        Alert.alert("Could not extract ID");
      }
    } else {
      Alert.alert("Invalid input");
    }
  };

  //========================================================================
  //Session loading screen
  //========================================================================
  if (!sessionContext.session) {
    return (
      <View>
        <LoadingScreen text="Connecting to session.." />
      </View>
    );
  }

  //========================================================================
  //If users role becomes kick -> remove them from session locally
  //========================================================================
  useEffect(() => {
    const newRole = sessionContext.activeSession?.members?.find(
      (member) => member.name === authContext.thisUser?.userName
    )?.role;

    if (newRole === "Admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    const isKicked = sessionContext.activeSession?.members?.some(
      (member) =>
        member.name === authContext.thisUser?.userName && member.role === "kick"
    );

    if (isKicked) {
      sessionContext.leaveSession(isKicked);
    }
  }, [sessionContext.activeSession?.members]);

  const togglePerms = (username: string) => {
    console.log("Toggle perms");
    sessionContext.togglePerms(username);
  };

  const { colors } = useThemeContext();

  return (
    <>
    
    
    
    <StatusBar hidden={false} backgroundColor="#000" translucent />

    <View style={styles.container}>
      <YoutubePlayer
        ref={playerRef}
        height={(screenWidth * 9) / 16}
        width={screenWidth}
        videoId={vidID}
        play={isReady ? play : false}
        onReady={() => {
          setIsReady(true);
        }}
        onChangeState={handleStateChange}
        onPlaybackRateChange={handleRateChange}
        playbackRate={playbackRate}
        frameborder="0"
        forceAndroidAutoplay={true}
        waitForBuffer={true}
      />

      {isHost || isAdmin ? (
        <View style={styles.searchVideo}>
          <View style={styles.videoSplit}>
            <DefaultInput
              textStyle={styles.vidInput}
              placeholder="Enter video URL or ID"
              onChangeText={setrawID}
            ></DefaultInput>
          </View>

          <View style={styles.videoSplit}>
            <View style={styles.searchVidHalf1}></View>
            <View style={styles.searchVidHalf2}>
              <DefaultButton
                btnStyle={styles.btnLoad}
                text="Load"
                onPress={findVid}
              ></DefaultButton>
            </View>
          </View>
        </View>
      ) : null}

      <View style={[styles.topActionBar, { borderColor: colors.bordercolor }]}>
        {isHost ? (
          <View style={styles.actionBarHalf1}>
            <DefaultButton
              btnStyle={styles.topActionBarButton}
              text="Stop Session"
              onPress={stopHost}
            ></DefaultButton>
          </View>
        ) : (
          <View style={styles.actionBarHalf1}>
            <DefaultButton
              btnStyle={styles.topActionBarButton}
              text="Leave Session"
              onPress={leaveSession}
            ></DefaultButton>
          </View>
        )}

        <View style={styles.actionBarHalf2}>
          <View style={styles.actionBarHalf2SPLIT1}></View>
          <View style={styles.actionBarHalf2SPLIT2}>
            <DefaultButton
              btnStyle={styles.btnLoad}
              text={play ? "Pause" : "Play"}
              onPress={tempPlayBtn}
            ></DefaultButton>
          </View>
        </View>
      </View>

      {/* <Text>State:{playerState}</Text>
      <Text>Play: {play}</Text>
      <Text>Time:{sessionContext.session?.videoState?.timeStamp}</Text>
      <Text>vidID:{vidID}</Text> */}

      <View
        style={[styles.viewerList, { backgroundColor: colors.btnBackground }]}
      >
        <DefaultText textStyle={styles.listTitle}>Session</DefaultText>
        <ScrollView
          style={styles.viewerListScroll}
          contentContainerStyle={styles.scrollContainer}
        >
          {sessionContext.activeSession?.members?.map((member) => {
            return (
              <ViewerItem
                key={member.name}
                username={member.name}
                role={member.role}
                togglePerm={(username) => togglePerms(username)}
                isHost={isHost}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    // backgroundColor: "#70b3ffc0",
    alignItems: "center",
    zIndex: 1,
  },
  searchVideo: {
    flexDirection: "row",
    marginTop: normalize(20),
    // backgroundColor: "red",
    width: "100%",
  },
  vidInput: {
    position: "relative",
    minWidth: "45%",
    textAlign: "center",
    fontSize: normalize(12),
  },

  btnLoad: {
    width: "50%",
  },

  videoSplit: {
    position: "relative",
    flex: 1,
    // borderColor: "black",
    // borderWidth: 0.5,
    flexDirection: "row",
    // backgroundColor: "blue",
    justifyContent: "center",
  },

  searchVidHalf1: {
    position: "relative",
    flex: 0.2,
    height: "100%",
    // borderColor: "black",
    // borderWidth: 0.5,
    alignItems: "center",
  },
  searchVidHalf2: {
    position: "relative",
    flex: 0.8,
    // borderColor: "black",
    // borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  topActionBar: {
    // backgroundColor: "green",
    width: "100%",
    flexDirection: "row",
    marginTop: normalize(15),
    borderBottomWidth: 1,
  },

  topActionBarButton: {},

  actionBarHalf1: {
    // backgroundColor: "yellow",
    flex: 1,
    alignItems: "center",
    // borderColor: "black",
    // borderWidth: 0.5,
  },
  actionBarHalf2: {
    // backgroundColor: "yellow",
    flex: 1,
    // alignItems: "flex-end",
    // borderColor: "black",
    // borderWidth: 0.5,
    flexDirection: "row",
  },

  actionBarHalf2SPLIT1: {
    flex: 0.2,
    // borderColor: "black",
    // borderWidth: 0.5,
  },
  actionBarHalf2SPLIT2: {
    flex: 0.8,
    // borderColor: "#000000",
    // borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },

  viewerList: {
    marginTop: "auto",
    width: "100%",
    alignItems: "center",
    // backgroundColor: "red",
    height: normalize(200),
  },
  viewerListScroll: {
    width: "100%",
    // backgroundColor: "blue",
  },

  scrollContainer: {
    alignItems: "center",
  },
  listTitle: {
    color: "white",
    marginBottom: normalize(10),
  },
});
