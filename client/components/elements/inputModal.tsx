import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
} from "react-native";
import DefaultButton from "./defaultButton";
import { normalize } from "./defaultText";
import DefaultView from "./defaultView";
import { useThemeContext } from "@/context/themeContext";
import DefaultInput from "./defaultInput";

type modalType = {
  title: string;
  placeholder: string;
  onPress: (input: string, input1?:string) => void;
  twoInput?: boolean;
};

export default function InputModal({
  title,
  placeholder,
  onPress,
  twoInput,
}: modalType) {
  const [modalVisible, setModalVisible] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [userInput1, setUserInput1] = useState("");

  const handleConfirm = () => {
    console.log("User entered:", userInput);
    setModalVisible(false);
    onPress(userInput, userInput1);
  };
  const { colors } = useThemeContext();

  const dynamicStyle: TextStyle = {
    color: colors.text,
  };

  return (
    <View style={styles.container}>
      <DefaultButton text={title} onPress={() => setModalVisible(true)} />

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <DefaultView viewStyle={styles.overlay}>
          <DefaultView viewStyle={styles.modalContent}>
            <Text style={[styles.title, dynamicStyle]}>{title}</Text>

            {twoInput ? (
              <>
                
                <DefaultInput
                  style={styles.input}
                  placeholder="Old password"
                  value={userInput}
                  onChangeText={setUserInput}
                />
                <DefaultInput
                  style={styles.input}
                  placeholder="New password"
                  value={userInput}
                  onChangeText={setUserInput1}
                />
              </>
            ) : (
              <DefaultInput
                style={styles.input}
                placeholder={placeholder}
                value={userInput}
                onChangeText={setUserInput}
              />
            )}

            <View style={styles.buttonRow}>
              <DefaultButton
                text="Cancel"
                onPress={() => setModalVisible(false)}
              />

              <DefaultButton text="Confirm" onPress={handleConfirm} />
            </View>
          </DefaultView>
        </DefaultView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: normalize(300),

    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 4,
    borderColor: "black",
    borderWidth: 1,
  },
  title: {
    fontSize: normalize(18),
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    height: normalize(40),
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 6,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
});
