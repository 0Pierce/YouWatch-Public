import React, { useState } from "react";

import LoginFrag from "./login";
import RegisterFrag from "./register";
import DefaultView from "../elements/defaultView";
import { StyleSheet } from "react-native";

export default function Auth() {
  const [showLogin, setShowLogin] = useState(true);
  return (
    <DefaultView viewStyle={styles.authContaier}>
      
      {showLogin ? <LoginFrag switchForm={ () => setShowLogin(false) } /> : <RegisterFrag switchForm={()=>{setShowLogin(true)}} />}
    </DefaultView>
  );
}

const styles = StyleSheet.create({
  authContaier: {
     position:"relative",
    // backgroundColor:"#1900ff",
    alignItems:"center",
    flex:1,
    // zIndex:2,

},
});
