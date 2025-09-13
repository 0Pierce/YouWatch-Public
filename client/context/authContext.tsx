import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import User from "../models/user";

/*====================================================================
Types
====================================================================*/
type authType = {
  thisUser: User | undefined;
  isAuthChecking: boolean;
  isAuthRdy: boolean;
  login: (email: string, pass: string) => void;
  register: (user: User) => void;
  logout: () => void;
  writeUser: (user: User) => void;
  readUser: (id: string) => void;
  googleAuth: () => void;
};

type AuthProviderProps = { children: React.ReactNode };

/*====================================================================
Context hook
====================================================================*/
const AuthContext = createContext<authType | undefined>(undefined);

export function useAuthContext(): authType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Calling auth context outside provider");
  return context;
}

/*====================================================================
Provider
====================================================================*/
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [thisUser, setUser] = useState<User | undefined>(undefined);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthRdy, setIsAuthRdy] = useState(false);
  const router = useRouter();

  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB!;

  /*====================================================================
  Init Google Signin
  ====================================================================*/
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });

    setIsAuthRdy(true);
  }, []);

  /*====================================================================
  Auth listener
  ====================================================================*/
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setIsAuthChecking(true);
      if (user) {
        const snap = await firestore().collection("users").doc(user.uid).get();
        if (snap.exists()) {
          const data = snap.data()!;
          setUser(new User(user.uid, data.username, data.email, ""));
        } else {
          setUser(undefined);
        }
      } else {
        setUser(undefined);
      }
      setIsAuthChecking(false);
    });

    return unsubscribe;
  }, []);

  /*====================================================================
  Google Signin
  ====================================================================*/
  const googleAuth = async () => {
    try {
      //Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      //Signin with Google
      const userInfo = await GoogleSignin.signIn();

      //Get the ID token
      const { idToken } = await GoogleSignin.getTokens();

      //Create Firebase credential
      const credential = auth.GoogleAuthProvider.credential(idToken);

      //Sign in
      const creds = await auth().signInWithCredential(credential);
      const u = creds.user;

      //Get username
      const email = u.email || "";
      let name = u.displayName || (email ? email.split("@")[0] : "GoogleUser");

    


      try {
        await firestore().collection("users").doc(u.uid).set(
          {
            username: name,
            email: email,
            provider: "google",
          },
          { merge: true }
        );
        console.log("Firestore user created:", u.uid);
        // Alert.alert(`Account created ${u.uid} `, `Welcome ${name}`);
      } catch (firestoreErr) {
        console.error("Error writing user to Firestore:", firestoreErr);
        Alert.alert("Firestore Error", `${firestoreErr}`);
        return;
      }

      //Update local state
      setUser(new User(u.uid, name, email, ""));
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Google Sign-In cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Google Sign-In already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Google Play Services not available or outdated");
      } else {
        console.error("Google Sign-In Error:", error);
        Alert.alert("Google Sign-In Error", error.message || `${error}`);
      }
    }
  };

  /*====================================================================
  Auth funcs
  ====================================================================*/
  const userAuth: authType = {
    thisUser,
    isAuthChecking,
    isAuthRdy,

    async login(email, pass) {
      try {
        const creds = await auth().signInWithEmailAndPassword(email, pass);
        if (!creds.user.emailVerified) {
          Alert.alert("Email not verified", "Check your inbox", [
            {
              text: "Resend",
              onPress: () => creds.user.sendEmailVerification(),
            },
          ]);
          await auth().signOut();
        }
      } catch (e) {
        Alert.alert("Login error", `${e}`);
      }
    },

    async register(user: User) {
      try {
        const creds = await auth().createUserWithEmailAndPassword(
          user.email,
          user.password
        );
        await creds.user.sendEmailVerification();
        user.id = creds.user.uid;
        await firestore().collection("users").doc(user.id).set({
          username: user.userName,
          email: user.email,
          provider: "password",
        });
        setUser(user);
      } catch (e) {
        Alert.alert("Register error", `${e}`);
      }
    },

    async logout() {
      try {
        await auth().signOut();
        setUser(undefined);
        await GoogleSignin.signOut();
      } catch (e) {
        console.error("Logout error", e);
      }
    },

    async writeUser(user: User) {
      try {
        await firestore()
          .collection("users")
          .doc(user.id)
          .set({ username: user.userName, email: user.email }, { merge: true });
      } catch (e) {
        console.error("Write user error", e);
      }
    },

    async readUser(id: string) {
      const snap = await firestore().collection("users").doc(id).get();
      if (snap.exists() && thisUser) {
        const data = snap.data()!;
        thisUser.userName = data.username;
        thisUser.email = data.email;
      }
    },

    googleAuth,
  };

  return (
    <AuthContext.Provider value={userAuth}>{children}</AuthContext.Provider>
  );
};
