/*====================================================================
Name: sessioNContext

Description: 
Creates a context that passes session functions and data between the application. 
Holds all logic pertaining to video sync, joining, hosting etc

//====================================================================*/

import { createContext, useContext, useRef, useState } from "react";
import Session from "@/models/session";
import VideoState from "@/models/videoState";
import { Alert } from "react-native";
import { collectionGroup, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuthContext } from "./authContext";
// import { fireDB } from "./authContext";
import { useRouter } from "expo-router";
import {
  Firestore,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getCountFromServer,
  collection,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { firestoreDB } from "@/context/authContext";
import { MAX_SESSIONS_ALLOWED } from "@/constants/userConstants";
import ActiveSession from "@/models/activeSession";

type sessionType = {
  session: Session | undefined;
  recentSessions: Session[];
  activeSession: ActiveSession | undefined;
  active: Boolean;
  createSession: (session: Session) => void; //Creates the session
  closeSession: () => void; //Closes the session
  readSession: () => Session; //Retrieves session information
  writeSession: (
    vidState: Partial<VideoState> | undefined,
    vidID?: string
  ) => void; //Updates session information
  writeActiveSession: (member: { name: string; role: string }) => void; //Updates members list within activeSession
  joinSession: (sTitle: string, sPassword?: string) => void;
  leaveSession: (isKicked?: boolean) => void;
  updateActiveSessionsList: () => Promise<{}[]>; //Updates the list from firestore
  kickUser: (username: string) => void;
  togglePerms: (username: string) => void;
};

const sessionContext = createContext<sessionType | undefined>(undefined);

//hook
export function useSessionContext(): sessionType {
  const context = useContext(sessionContext);

  if (!context) {
    throw new Error("Calling session context outside provider");
  } else {
    return context;
  }
}

type SessionProviderProps = {
  children: React.ReactNode;
};

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | undefined>(
    undefined
  );
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  const user = useAuthContext();
  const unSubSessionRef = useRef<null | (() => void)>(null);
  const unSubStateRef = useRef<null | (() => void)>(null);
  const unSubViewersRef = useRef<null | (() => void)>(null);
  const router = useRouter();
  const sessionInfo: sessionType = {
    session,
    active,
    activeSession,
    recentSessions,

    //========================================================================
    //Creates a session -> writes to DB
    //========================================================================
    async createSession(sesh: Session) {
      try {
        const seshRef = doc(firestoreDB, "sessions", sesh.sName);
        const seshSnap = await getDoc(seshRef);

        const activeSessionsRef = collection(
          firestoreDB,
          "activeSessions",
          user.thisUser!.id,
          "active"
        );

        const activeSessionCountSnap = await getCountFromServer(
          activeSessionsRef
        );
        //Checks if user already has a session active, and if the session name is unique
        if (
          activeSessionCountSnap.data().count < MAX_SESSIONS_ALLOWED &&
          !seshSnap.exists()
        ) {
          console.log(`Creating session with: ${sesh.toString()} `);
          await setDoc(doc(firestoreDB, "sessions", sesh.sName), {
            ID: sesh.sessionID,
            sessionName: sesh.sName,
            hostName: user.thisUser?.userName,
            hostID: user.thisUser?.id,
            ...(sesh.sPassword && { password: sesh.sPassword }),
          });

          await setDoc(
            doc(firestoreDB, "sessions", sesh.sName, "state", "latest"),
            {
              timeStamp: 0,
              state: "paused",
              ready: false,
              playRate: 1,
            }
          );

          //Firestore listener for session only
          unSubSessionRef.current = onSnapshot(seshRef, (snapshot) => {
            const seshDB = snapshot.data();
            console.log(`Session Read for ${user.thisUser?.userName}`);
            if (seshDB) {
              const sessionData = new Session(
                seshDB!.ID,
                seshDB!.sessionName,
                seshDB!.hostName,
                seshDB!.hostID,
                seshDB?.password,
                seshDB?.videoID,
                undefined
              );
              // console.log(sessionData);
              setSession((prev) => {
                if (prev) {
                  sessionData.videoState = prev.videoState;
                }
                return sessionData;
              });
            } else {
              console.log("ERROR OBTAINING SESSION DATA SNAPSHOT");
            }
          });

          //reference to the state
          const seshStateRef = doc(
            firestoreDB,
            "sessions",
            sesh.sName,
            "state",
            "latest"
          );

          //Firestore listener for videoState only
          unSubStateRef.current = onSnapshot(seshStateRef, (snapshot) => {
            const seshStateDB = snapshot.data();
            console.log("HOST: RECIEVING VIDEO STATE SNAPSHOT");
            console.log(`time: ${Date.now()} for ${user.thisUser?.userName}`);
            //TODO: Is check here needed? Balance performance with safety
            if (seshStateDB) {
              console.log("HOST: seshStateDB valid");
              const stateData = new VideoState(
                seshStateDB.timeStamp,
                seshStateDB.state,
                seshStateDB.ready,
                seshStateDB.playRate,
                seshStateDB.lastUpdated
              );

              console.log("HOST: state data " + stateData.toString());

              setSession((prev) => {
                if (prev) {
                  const updated = new Session(
                    prev.sessionID,
                    prev.sName,
                    prev.hostName,
                    prev.hostID,
                    prev?.sPassword,
                    prev.videoID
                  );

                  updated.videoState = stateData;

                  return updated;
                } else {
                  return prev;
                }
              });
            } else {
              console.log("ERROR OBTAINING VIDEOSTATE DATA SNAPSHOT");
            }
          });

          var currentdate = new Date();
          var datetime =
            "Last Sync: " +
            currentdate.getDate() +
            "/" +
            (currentdate.getMonth() + 1) +
            "/" +
            currentdate.getFullYear() +
            " @ " +
            currentdate.getHours() +
            ":" +
            currentdate.getMinutes();

          const seshActiveRef = doc(
            firestoreDB,
            "activeSessions",
            user.thisUser!.id,
            "active",
            sesh.sessionID
          );

          await setDoc(seshActiveRef, {
            title: sesh.sName,
            hostName: user.thisUser?.userName,
            isPrivate: !!sesh.sPassword,
            createdAt: datetime,
            members: [{ name: sesh.hostName, role: "Host" }],
          });

          unSubViewersRef.current = onSnapshot(seshActiveRef, (snapshot) => {
            const seshActiveDB = snapshot.data();

            if (seshActiveDB) {
              const activeSessionData = new ActiveSession(
                seshActiveDB.title,
                seshActiveDB.hostName,
                seshActiveDB.hasPassword,
                seshActiveDB.createdAt,
                seshActiveDB.members
              );

              setActiveSession(activeSessionData);
            }
          });
          setActive(true);
          console.log("Session created sucessfully");
        } else {
          //Either active session or title is not unique
          if (seshSnap.exists()) {
            Alert.alert("Session Title in-use");
            console.log("Session Title in-use");
          } else if (
            activeSessionCountSnap.data().count >= MAX_SESSIONS_ALLOWED
          ) {
            const sessionSnap = await getDocs(activeSessionsRef);
            const sessionTitles = sessionSnap.docs.map(
              (doc) => doc.data().title
            );
            console.log(sessionTitles);
            Alert.alert(
              "You already have an active session",
              `Title: ${sessionTitles.join(", ")}`
            );
            console.log("Active session detected");
          }
        }
      } catch (error) {
        console.log("Error creating session" + error);
        Alert.alert("Creation Error", ": " + error);
      }
    },

    //========================================================================
    //Closes the existing session -> deletes from DB
    //========================================================================
    async closeSession() {
      try {
        //const seshListRef = ref(fireDB, "activeSessions/" + user.thisUser?.id )
        if (unSubSessionRef.current) {
          unSubSessionRef.current();
        }

        if (unSubStateRef.current) {
          unSubStateRef.current();
        }

        const stateRef = doc(
          firestoreDB,
          "sessions",
          session!.sName,
          "state",
          "latest"
        );
        await updateDoc(stateRef, { playRate: -1 }); //Flag to kick everyone from the session

        await deleteDoc(
          doc(
            firestoreDB,
            "activeSessions",
            user.thisUser!.id,
            "active",
            session!.sessionID
          )
        );
        await deleteDoc(
          doc(firestoreDB, "sessions", session!.sName, "state", "latest")
        );
        await deleteDoc(doc(firestoreDB, "sessions", session!.sName));

        // console.log(session?.sessionID);

        // console.log(
        //   "activeSessions/" + user.thisUser?.id + "/" + session?.sessionID
        // );

        //Setting this to false switches between Video and Session components
        setActive(false);
        setSession(undefined);
        console.log("Closed session");
      } catch (error) {
        console.log("Couldnt delete session: " + error);
        Alert.alert("Error removing session", `${error}`);
      }
    },

    //========================================================================
    //Allows a user to retrieve session updates on call - currently not being used
    //========================================================================
    readSession() {
      //Return updated session
      const updatedSession = new Session("1", "1", "1", "1");
      return updatedSession;
    },

    //========================================================================
    //Updates the session and state in realtime
    //========================================================================
    async writeSession(
      vidState?: Partial<VideoState> | undefined,
      vidID?: string
    ) {
      console.log(
        `Writing session: Undefined?: ${
          vidState != undefined
        }, Valid: ${vidState}`
      );
      //=====Update only video state=====
      if (vidState != undefined && vidState !== null) {
        try {
          console.log("****Updating state******");

          //Removes any undefined values from the given state
          const newState = {
            ...Object.fromEntries(
              Object.entries(vidState).filter(([_, v]) => v !== undefined)
            ),
            lastUpdated: serverTimestamp(),
          };

          await updateDoc(
            doc(firestoreDB, "sessions", session!.sName, "state", "latest"),
            newState
          );

          console.log("****Updated state***");
        } catch (error) {
          //TODO: setup so admins have permission to change state and handle non-admins
          //Currently will drop an error if a viewer does any action that triggers an update
          Alert.alert("Error updating state", `${error}`);
          console.log("Error updating state: " + error);
          console.log(vidState);
        }

        //=====Updates only vidID=====
      } else if (vidState === undefined && vidID !== undefined) {
        console.log("***Updating vidID***");
        try {
          await updateDoc(doc(firestoreDB, "sessions", session!.sName), {
            videoID: vidID,
          });
        } catch (error) {
          Alert.alert("Error updating session", `${error}`);
          console.log("Error updating session: " + error);
        }
      } else {
        //This code should never run, if it does, something fucked up bad
        Alert.alert("Critical failure occured -contact dev");
        console.log(
          "=====***Critical failure occured in writeSession***======"
        );
        console.log("Critical:" + vidState + " " + vidID);
      }
    },

    //========================================================================
    //Updates activeSession members list
    //========================================================================
    async writeActiveSession(member: { name: string; role: string }) {
      const seshActiveRef = doc(
        firestoreDB,
        "activeSessions",
        session!.hostID,
        "active",
        session!.sessionID
      );

      const seshActiveSnap = await getDoc(seshActiveRef);
      const members = seshActiveSnap.data()?.members || [];
      let found = false;
      members.forEach((item: { name: string; role: string }) => {
        if (item.name === member.name) {
          item.role = member.role;
          found = true;
          console.log("Updating member");
        }
      });
      if (!found) {
        console.log("No member found when writing, adding instead");
        members.push(member);
      }

      await updateDoc(seshActiveRef, { members: members });
    },

    //========================================================================
    //Allows players to join a session and recieve updates via firestore listeners
    //========================================================================
    async joinSession(sTitle: string, sPassword?: string) {
      console.log("Joining Session: " + sTitle);
      console.log("pass: " + sPassword);

      try {
        // const titleData = await get(ref(fireDB, `sessions/${sTitle}`));

        const sessionRef = doc(firestoreDB, "sessions", sTitle);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
          const seshDBSnap = sessionSnap.data();
          const hostID = seshDBSnap.hostID;
          const sessionID = seshDBSnap.ID;

          //Check for password
          if ((sessionSnap.data().password && sPassword) || seshDBSnap.hostName === user.thisUser?.userName) {
            console.log("Joining with password");
            //==========Locked==========

            //Check if provided password is valid
            if ((sessionSnap.data().password === sPassword) || seshDBSnap.hostName === user.thisUser?.userName) {
              console.log("They match!");

              unSubSessionRef.current = onSnapshot(sessionRef, (snapshot) => {
                console.log(
                  "^^^^^^^^^RECIEVED SESSION UPDATE FROM DB^^^^^^^^^^"
                );
                const seshDB = snapshot.data();
                // console.log("SeshDB: " + seshDB);

                const sessionData = new Session(
                  seshDB!.ID,
                  seshDB!.sessionName,
                  seshDB!.hostName,
                  seshDB!.hostID,
                  seshDB?.password,
                  seshDB?.videoID,
                  undefined
                );
                // console.log("STORING SESSION DATA:" + sessionData.toString());
                setSession((prev) => {
                  if (prev) {
                    sessionData.videoState = prev.videoState;
                  }
                  return sessionData;
                });
              });

              const seshStateRef = doc(
                firestoreDB,
                "sessions",
                sTitle,
                "state",
                "latest"
              );

              unSubStateRef.current = onSnapshot(seshStateRef, (snapshot) => {
                const seshStateDB = snapshot.data();
                console.log("VIEWER: RECIEVING VIDEO STATE SNAPSHOT");
                if (seshStateDB) {
                  const stateData = new VideoState(
                    seshStateDB.timeStamp,
                    seshStateDB.state,
                    seshStateDB.ready,
                    seshStateDB.playRate,
                    seshStateDB.lastUpdated
                  );

                  setSession((prev) => {
                    if (prev) {
                      const updated = new Session(
                        prev.sessionID,
                        prev.sName,
                        prev.hostName,
                        prev.hostID,
                        prev?.sPassword,
                        prev.videoID
                      );

                      updated.videoState = stateData;

                      return updated;
                    } else {
                      return prev;
                    }
                  });
                } else {
                  console.log("ERROR OBTAINING VIDEOSTATE DATA SNAPSHOT");
                }
              });

              const seshActiveRef = doc(
                firestoreDB,
                "activeSessions",
                hostID,
                "active",
                sessionID
              );

              unSubViewersRef.current = onSnapshot(
                seshActiveRef,
                (snapshot) => {
                  const seshActiveDB = snapshot.data();

                  if (seshActiveDB) {
                    const activeSessionData = new ActiveSession(
                      seshActiveDB.title,
                      seshActiveDB.hostName,
                      seshActiveDB.hasPassword,
                      seshActiveDB.createdAt,
                      seshActiveDB.members
                    );

                    setActiveSession(activeSessionData);
                  }
                }
              );

              const docSnap = await getDoc(seshActiveRef);

              if (docSnap.exists()) {
                const data = docSnap.data();
                const members = data.members || [];

                const alreadyExists = members.some(
                  (member: any) => member.name === user.thisUser?.userName
                );

                if (!alreadyExists) {
                  members.push({
                    name: user.thisUser?.userName,
                    role: "Viewer",
                  });

                  await updateDoc(seshActiveRef, {
                    members: members,
                  });
                } else {
                  console.log("User already exists in members, skipping add.");
                }
              }
              setActive(true);
            } else {
              console.log("No match :(");
              Alert.alert("Incorrect Password");
            }
          } else if (!sessionSnap.data().password) {
            //==========Unlocked==========
            console.log("Joining without password");

            unSubSessionRef.current = onSnapshot(sessionRef, (snapshot) => {
              const seshDB = snapshot.data();
              console.log("SESSION SNAPSHOT FOR: " + user.thisUser?.userName);
              console.log(
                "RECIEVING SESSION SNAPSHOT DATA " + JSON.stringify(seshDB)
              );
              console.log("SNAPSHOT VIDEOID: " + seshDB?.videoID);
              const sessionData = new Session(
                seshDB!.ID,
                seshDB!.sessionName,
                seshDB!.hostName,
                seshDB!.hostID,
                seshDB?.password,
                seshDB?.videoID,
                undefined
              );
              // console.log("SessionData: "+sessionData);
              setSession((prev) => {
                if (prev) {
                  sessionData.videoState = prev.videoState;
                }
                return sessionData;
              });
            });

            const seshStateRef = doc(
              firestoreDB,
              "sessions",
              sTitle,
              "state",
              "latest"
            );

            unSubStateRef.current = onSnapshot(seshStateRef, (snapshot) => {
              const seshStateDB = snapshot.data();
              console.log(
                `VIEWER ${user.thisUser?.userName}: RECIEVING VIDEO STATE SNAPSHOT`
              );
              console.log(`time: ${Date.now()} for ${user.thisUser?.userName}`);
              if (seshStateDB) {
                const stateData = new VideoState(
                  seshStateDB.timeStamp,
                  seshStateDB.state,
                  seshStateDB.ready,
                  seshStateDB.playRate,
                  seshStateDB.lastUpdated
                );
                console.log("State data: " + stateData.toString());
                setSession((prev) => {
                  if (prev) {
                    const updated = new Session(
                      prev.sessionID,
                      prev.sName,
                      prev.hostName,
                      prev.hostID,
                      prev?.sPassword,
                      prev.videoID
                    );

                    updated.videoState = stateData;

                    return updated;
                  } else {
                    return prev;
                  }
                });
              } else {
                console.log("ERROR OBTAINING VIDEOSTATE DATA SNAPSHOT");
              }
            });

            const seshActiveRef = doc(
              firestoreDB,
              "activeSessions",
              hostID,
              "active",
              sessionID
            );

            unSubViewersRef.current = onSnapshot(seshActiveRef, (snapshot) => {
              const seshActiveDB = snapshot.data();

              if (seshActiveDB) {
                const activeSessionData = new ActiveSession(
                  seshActiveDB.title,
                  seshActiveDB.hostName,
                  seshActiveDB.hasPassword,
                  seshActiveDB.createdAt,
                  seshActiveDB.members
                );

                setActiveSession(activeSessionData);
              }
            });

            const docSnap = await getDoc(seshActiveRef);

            if (docSnap.exists()) {
              const data = docSnap.data();
              const members = data.members || [];

              const alreadyExists = members.some(
                (member: any) => member.name === user.thisUser?.userName
              );

              if (!alreadyExists) {
                members.push({
                  name: user.thisUser?.userName,
                  role: "Viewer",
                });

                await updateDoc(seshActiveRef, {
                  members: members,
                });
              } else {
                console.log("User already exists in members, skipping add.");
              }
            }

            setActive(true);
          } else {
            console.log("Incorrect Password");
            Alert.alert("Incorrect Password");
          }
        } else {
          Alert.alert("Session does not exist");
          console.log("Session does not exist");
        }
      } catch (error) {
        console.log("Error joining session " + error);
      }
      //Check passwords
    },

    //========================================================================
    //Allows viewers to leave the sessions, unsubscribes from listeners & removes local session
    //========================================================================
    async leaveSession(isKicked) {
      if (unSubSessionRef.current) {
        unSubSessionRef.current();
      }

      if (unSubStateRef.current) {
        unSubStateRef.current();
      }

      if (unSubViewersRef.current) {
        unSubViewersRef.current();
      }

      try {
        const seshActiveRef = doc(
          firestoreDB,
          "activeSessions",
          session!.hostID,
          "active",
          session!.sessionID
        );

        const seshActiveSnap = await getDoc(seshActiveRef);
        const members = seshActiveSnap.data()?.members || [];

        const updatedMembers = members.filter(
          (member: { name: string }) => member.name !== user.thisUser?.userName
        );

        console.log(`Removing user from active session: ${seshActiveRef.path}`);
        await updateDoc(seshActiveRef, {
          members: updatedMembers,
        });
      } catch (error) {
        console.log("ERROR: Deleting active session");
      }

      //We know a session must exist if we are leaving one
      //Can wrap this in an if, in case of any edge cases later

      //Need to make a DB call here somewhere, for it to update in real time
      //Put a onValue for this where if the active session gets deleted, then remove it

      setSession(undefined);
      setActive(false);

      if (isKicked) {
        Alert.alert("You've been Kicked from the session");
      }
    },

    //========================================================================
    //For now since sessions dont last after they are closed
    //Simply store them locally -> leave function empty until it needs updates from DB
    //========================================================================

    async updateActiveSessionsList(): Promise<any[]> {
      try {
        const activeSessionsRef = collectionGroup(firestoreDB, "active");
        console.log("Updating session list for " + user.thisUser?.userName);
        const activeSessionSnap = await getDocs(activeSessionsRef);

        const sessionsData = activeSessionSnap.docs.map((doc) => ({
          title: doc.data().title,
          host: doc.data().hostName,
          isPrivate: doc.data().isPrivate,
        }));
        console.log("Data: " + sessionsData);
        return sessionsData;
      } catch (error) {
        console.log("Failed fetching session list: " + error);
        return [];
      }
    },

    //========================================================================
    //Sets user role to kick
    //========================================================================
    async kickUser(username: string) {
      if (!session) {
        console.log("Invalid session when kicking user");
        return;
      }

      const seshActiveRef = doc(
        firestoreDB,
        "activeSessions",
        session.hostID,
        "active",
        session.sessionID
      );

      const docSnap = await getDoc(seshActiveRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const members = data.members || [];

        const updatedMembers = members.map((member: any) =>
          member.name === username ? { ...member, role: "kick" } : member
        );

        await updateDoc(seshActiveRef, {
          members: updatedMembers,
        });
      } else {
        console.log("Session doc not found");
      }
    },

    async togglePerms(username) {
      if (!session) {
        console.log("Invalid session when updating user");
        return;
      }

      try {
        const seshActiveRef = doc(
          firestoreDB,
          "activeSessions",
          session.hostID,
          "active",
          session.sessionID
        );

        const docSnap = await getDoc(seshActiveRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const members = data.members || [];

          const updatedMembers = members.map((member: any) =>
            member.name === username
              ? {
                  ...member,
                  role: member.role === "Admin" ? "Viewer" : "Admin",
                }
              : member
          );

          await updateDoc(seshActiveRef, {
            members: updatedMembers,
          });
        } else {
          console.log("Session doc not found");
        }
      } catch (error) {
        console.log("Error updating role: " + error);
      }
    },
  };

  //========================================================================
  return (
    <sessionContext.Provider value={sessionInfo}>
      {children}
    </sessionContext.Provider>
  );
};
