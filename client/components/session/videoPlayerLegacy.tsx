// import Button from "@/components/elements/button";
// import { useEffect, useRef, useState } from "react";
// import {
//   StyleSheet,
//   View,
//   TextInput,
//   Alert,
//   Text,
//   Dimensions,
// } from "react-native";
// import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
// import { useSessionContext } from "@/context/sessionContext";
// import { useAuthContext } from "@/context/authContext";
// import VideoState from "../../models/videoState";
// import Session from "@/models/session";
// import ActiveSession from "@/models/activeSession";

// export default function VideoPlayer() {
//   //====Session state====
//   const [rawID, setrawID] = useState("");
//   const [isHost, setIsHost] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [videoState, setVideoState] = useState<VideoState | undefined>(
//     undefined
//   );
//   const [userTypeFlag, setUserTypeFlag] = useState(true);
//   const stateChangeFlag = useRef<boolean>(true); //Prevents state change loop
//   //====================

//   //====Video state==== - Used for getting local changes and updating DB
//   const [vidID, setVidId] = useState("");
//   const [timeStamp, setTimeStamp] = useState<number | undefined>(0);
//   const [playerState, setPlayerState] = useState("");
//   const [isReady, setIsReady] = useState(false);
//   const [playbackRate, setPlaybackRate] = useState(1);
//   const [play, setPlay] = useState(false); //Based on player state from database
//   //===================

//   //======Contexts & refs======
//   const sessionContext = useSessionContext();
//   const authContext = useAuthContext();

//   const playerRef = useRef<YoutubeIframeRef>(null);
//   const screenWidth = Dimensions.get("window").width;
//   //====================

//   //DEBUGGING

//   //========================================================================
//   //Determine if user is host or viewer for conditional rendering
//   //TODO: Unmount this after user has been checked or implement more functionality, otherwise its an unneeded drag on performance
//   //========================================================================
//   useEffect(() => {
//     console.log("session useEffect ran");
//     if (userTypeFlag) {
//       if (sessionContext.session) {
//         //Loads the current video
//         if (sessionContext.session.videoID) {
//           console.log("Session has active video");
//           setVidId(sessionContext.session.videoID);
//         }

//         console.log("=====CHECKING USER TYPE=====");
//         console.log(
//           `${authContext.thisUser?.userName} === ${sessionContext.session?.hostName}`
//         );
//         if (
//           authContext.thisUser?.userName === sessionContext.session?.hostName
//         ) {
//           console.log("You are the host");
//           setIsHost(true);
//           setIsAdmin(true);
//         } else {
//           console.log("You are a viewer");
//           setIsHost(false);
//           setIsAdmin(false);
//         }
//         setUserTypeFlag(false);
//       } else {
//         setUserTypeFlag(true);
//         console.log("Loading session");
//       }
//     }
//   }, [sessionContext.session]);

//   //========================================================================
//   //Keep track of player state updates from DB
//   //========================================================================
//   useEffect(() => {
//     console.log("Checking DB with Local state");
//     if (isReady && playerState != sessionContext.session?.videoState?.state) {
//       if (sessionContext.session?.videoState?.state === "playing") {
//         console.log("Playing");
//         stateChangeFlag.current = false;
//         setPlay(true);
//         setPlayerState("playing");
//       } else {
//         stateChangeFlag.current = false;
//         setPlay(false);
//         setPlayerState("paused");
//         console.log("Paused");
//       }
//     }
//   }, [sessionContext.session?.videoState?.state]);

//   //========================================================================
//   //Updates the local timestamp from DB
//   //========================================================================
//   useEffect(() => {
//     console.log("updating local timestamp from DB");

//     console.log(isReady);
//     console.log(playerRef.current);
//     console.log(sessionContext.session?.videoID);
//     console.log(sessionContext.session?.videoState?.timeStamp);
//     if (
//       isReady &&
//       playerRef.current &&
//       sessionContext.session?.videoState?.timeStamp !== undefined &&
//       sessionContext.session?.videoState?.timeStamp >= 0 &&
//       sessionContext.session?.videoID
//     ) {
//       const dbTime = sessionContext.session?.videoState?.timeStamp;

//       playerRef.current.getCurrentTime().then((currTime) => {
//         if (dbTime != undefined) {
//           const delta = Math.abs(currTime - dbTime);

//           console.log("Current time:", currTime, "DB time:", dbTime);

//           if (delta > 1) {
//             console.log("Seeking to:", dbTime);
//             playerRef.current?.seekTo(dbTime, true);
//             setTimeStamp(dbTime);
//           }
//         } else {
//           console.log("DB TIME UNDEFINED INSIDE TIMESTAMP USEEFFECT");
//         }
//       });
//     }
//   }, [sessionContext.session?.videoState?.timeStamp]);

//   //========================================================================
//   //Updates vid ID from DB
//   //========================================================================
//   useEffect(() => {
//     console.log("videoID useEffect");
//     if (
//       sessionContext.session?.videoID &&
//       sessionContext.session?.videoID != vidID
//     ) {
//       setVidId(sessionContext.session?.videoID);
//     }
//   }, [sessionContext.session?.videoID]);

//   //========================================================================
//   //Updates vid ID in database on local change
//   //========================================================================
//   useEffect(() => {
//     console.log("vidID changed");

//     if (sessionContext.session) {
//       sessionContext.session.videoID = vidID;
//       sessionContext.writeSession(undefined, vidID);
//     }
//   }, [vidID]);

//   //========================================================================
//   //Allows users to enter youtube links and extracts their IDs
//   //========================================================================
//   const findVid = () => {
//     if (rawID) {
//       const extract = rawID.match(
//         /(?:youtu\.be\/|youtube\.com\/.*[?&]v=)?([a-zA-Z0-9_-]{11})(?:[&?]|$)/
//       );
//       console.log(extract);
//       setVidId(extract ? extract[1] : "empty");
//     } else {
//       Alert.alert("Invalid input");
//     }
//   };

//   const handleStateChange = async (state: string) => {
//     if (stateChangeFlag.current) {
//       console.log("ran handle state change");
//       if (state == "playing" || state == "paused") {
//         if (isHost || isAdmin) {
//           setPlayerState(state);
//           if (state != sessionContext.session?.videoState?.state) {
//             if (playerRef.current?.getCurrentTime() !== undefined) {
//               const timeStamp = Math.round(
//                 await playerRef.current?.getCurrentTime()
//               );
//               sessionContext.writeSession({ state, timeStamp });
//             } else {
//               sessionContext.writeSession({ state });
//             }
//           }
//         } else {
//           console.log("---NO PERMISSIONS---");
//           //I wanted to do this by just flipping setPlay, but it seems to avoid some edge cases this is the safest
//           if (sessionContext.session?.videoState?.state == "playing") {
//             if (sessionContext.session?.videoState?.timeStamp != undefined) {
//               console.log("Seeking to timestamp stateChange 1");
//               playerRef.current?.seekTo(
//                 sessionContext.session?.videoState?.timeStamp,
//                 true
//               );
//             }
//             stateChangeFlag.current = false;
//             setPlay(true);
//             setPlayerState("playing");
//           } else {
//             if (sessionContext.session?.videoState?.timeStamp != undefined) {
//               console.log("Seeking to timestamp stateChange 2");
//               playerRef.current?.seekTo(
//                 sessionContext.session?.videoState?.timeStamp,
//                 true
//               );
//             }
//             stateChangeFlag.current = false;
//             setPlay(false);
//             setPlayerState("paused");
//           }
//         }
//       }
//     } else {
//       stateChangeFlag.current = true;
//     }
//   };

//   const handleRateChange = (playRate: number) => {
//     console.log("changing player rate");
//     if (stateChangeFlag.current) {
//       stateChangeFlag.current = false;
//       sessionContext.writeSession({ playRate });
//     } else {
//       stateChangeFlag.current = true;
//     }
//   };

//   const stopHost = () => {
//     sessionContext.closeSession();
//   };

//   const leaveSession = () => {
//     sessionContext.leaveSession();
//   };

//   const askPermissions = () => {
//     //Add response logic from the host later
//     //TODO: Let host assign admin to viewers
//     //Right now leave as toggle for testing
//     setIsAdmin(!isAdmin);
//   };

//   const setPlayerTimeStamp = (time: number) => {
//     playerRef.current?.seekTo(time, true);
//   };

//   if (!sessionContext.session) {
//     return (
//       <View>
//         <Text>Loading session...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <YoutubePlayer
//         ref={playerRef}
//         height={(screenWidth * 9) / 16}
//         width={screenWidth}
//         videoId={sessionContext.session.videoID}
//         play={isReady ? play : false}
//         onReady={() => {
//           setIsReady(true);
//         }}
//         onChangeState={handleStateChange}
//         onPlaybackRateChange={handleRateChange}
//         playbackRate={playbackRate}
//         frameborder="0"
//       />

//       {isHost || isAdmin ? (
//         <View>
//           <TextInput
//             style={styles.input}
//             placeholder="vid id"
//             onChangeText={setrawID}
//           ></TextInput>
//           <Button text="Find Vid" onPress={findVid}></Button>
//         </View>
//       ) : (
//         <View>
//           <Button text="Ask Permissions" onPress={askPermissions}></Button>
//         </View>
//       )}

//       {/* TODO: Delete this -> its for testing only */}
//       <Button
//         text="TESTING: Toggle permissions"
//         onPress={askPermissions}
//       ></Button>

//       {isHost ? (
//         <Button text="Stop Session" onPress={stopHost}></Button>
//       ) : (
//         <Button text="Leave Session" onPress={leaveSession}></Button>
//       )}
//       {/* <Text>LIST OF VIEWERS HERE</Text> */}
//       {/* <Text>Debugging:</Text> */}
//       <Text>State:{playerState}</Text>
//       <Text>Play: {play}</Text>
//       <Text>Time:{timeStamp}</Text>
//       <Text>
//         Members:{" "}
//         {sessionContext.activeSession?.members
//           ?.map((member) => `${member.name}, ${member.ready}`)
//           .join(" | ")}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#ff313155",
//     width: "99%",
//     flex: 1,
//     overflow: "hidden",
//     alignItems: "center",
//   },
//   input: {
//     borderColor: "black",
//     borderWidth: 1,
//     width: "50%",
//     margin: 5,
//   },
// });
