/*
Title: userContext (Native Firebase)
Purpose: Store and process data relevant to user operations
Description: A context that facilitates operations for the user, includes user preferences, friendslist, sessionHistory
*/

import { createContext, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { useThemeContext } from "./themeContext";
import { useAuthContext } from "./authContext";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

type userType = {
  deleteAccount: (password: string) => void;
  changePassword: (oldPassword: string, newPassword: string) => void;
  changeUsername: (newUsername: string) => void;

  // Future: Add friend, remove friend, load friends
};

const userContext = createContext<userType | undefined>(undefined);

export function useUserContext(): userType {
  const context = useContext(userContext);
  if (!context) throw new Error("Calling user context outside provider");
  return context;
}

type UserProviderProps = {
  children: React.ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const themeContext = useThemeContext();
  const authContext = useAuthContext();

  /*====================================================================
    Save theme 
  ====================================================================*/
  useEffect(() => {
    if (!authContext.thisUser) return;

    const timeout = setTimeout(async () => {
      const userRef = firestore()
        .collection("users")
        .doc(authContext.thisUser!.id);
      const snapshot = await userRef.get();
      const currentTheme = snapshot.data()?.theme;

      if (currentTheme !== themeContext.theme) {
        console.log("Saved theme");
        await userRef.update({ theme: themeContext.theme });
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [themeContext.theme]);

  /*====================================================================
    Load theme on login
  ====================================================================*/
  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!authContext.thisUser) return;

      const userRef = firestore()
        .collection("users")
        .doc(authContext.thisUser.id);
      const snapshot = await userRef.get();
      const userTheme = snapshot.data()?.theme;

      if (userTheme) {
        themeContext.changeTheme(userTheme);
      }
    };

    fetchUserTheme();
  }, [authContext.thisUser]);

  /*====================================================================
    User operations
  ====================================================================*/
  const userInfo: userType = {
    async deleteAccount(password?: string) {
      const user = auth().currentUser;
      if (!user) return;

      try {
        let credential;

        if (user.providerData.some((p) => p.providerId === "password")) {
          // Email/password user
          if (!user.email || !password) {
            Alert.alert("Password required for email accounts");
            return;
          }
          credential = auth.EmailAuthProvider.credential(user.email, password);
        } else if (
          user.providerData.some((p) => p.providerId === "google.com")
        ) {
          // Google Sign-In user
          const { idToken } = await GoogleSignin.getTokens();
          credential = auth.GoogleAuthProvider.credential(idToken);
        } else {
          Alert.alert("Unsupported provider");
          return;
        }

        // Reauthenticate
        await user.reauthenticateWithCredential(credential);

        // Delete Firestore user document
        await firestore().collection("users").doc(user.uid).delete();

        // Delete Firebase Auth user
        await user.delete();

        Alert.alert("Account deleted");
      } catch (error: any) {
        Alert.alert("Failed to delete account", error.message);
      }
    },

    async changePassword(oldPassword: string, newPassword: string) {
      const user = auth().currentUser;
      if (!user || !user.email) {
        Alert.alert("User not logged in");
        return;
      }

      try {
        const credential = auth.EmailAuthProvider.credential(
          user.email,
          oldPassword
        );
        await user.reauthenticateWithCredential(credential);

        await user.updatePassword(newPassword);
        Alert.alert("Password updated successfully");
      } catch (error: any) {
        Alert.alert("Failed to update password", error.message);
      }
    },

    async changeUsername(newUsername: string) {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("User not logged in");
        return;
      }

      try {
        const userRef = firestore().collection("users").doc(user.uid);
        await userRef.update({ username: newUsername });

        Alert.alert("Username updated successfully");
        await user.reload();
      } catch (error: any) {
        Alert.alert("Failed to update username", error.message);
      }
    },
  };

  return (
    <userContext.Provider value={userInfo}>{children}</userContext.Provider>
  );
};
