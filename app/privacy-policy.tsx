import HeaderBar from "@/components/Header";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  ImageBackground,
} from "react-native";

interface PrivacyPolicyScreenProps {
  onAccept: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
  onAccept,
}) => {
  const { t } = useTranslation();

  return (
    <ImageBackground
      source={require("../assets/images/bg1.png")}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(11, 91, 145, 0.95)", "rgba(11, 91, 145, 0.95)"]}
        style={styles.gradient}
      />
      <HeaderBar />
      <View style={styles.scrollView}>
        <Text style={styles.title}>{t("privacyPolicy")}</Text>
        <Text style={styles.content}>{t("privacyPolicyContent")}</Text>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://goldenqueenandroid.com/policy/")
          }
        >
          <Text style={styles.link}>{t("privacyPolicyLink")}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
        <Image
          source={require("../assets/images/accept.png")}
          style={styles.buttonImage}
        />{" "}
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
  },
  content: {
    fontSize: 18,
    lineHeight: 24,
    color: "#fff",
    textAlign: "center",
  },
  link: {
    color: "white",
    marginTop: 55,
    textDecorationLine: "underline",
    fontSize: 18,
    textAlign: "center",
  },
  acceptButton: {
    alignItems: "center",
  },
  buttonImage: {
    width: 350,
    height: 100,
    resizeMode: "contain",
  },
  acceptText: {
    color: "#fff",
    fontSize: 18,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default PrivacyPolicyScreen;
