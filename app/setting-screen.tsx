import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import { useTranslation } from "react-i18next";

import useBackgroundStore from "@/store/useBackground";
import useLanguageStore from "@/store/useLanguage";
import useSoundVibrationStore from "@/store/useSoundVibrationStore";
import useBalanceStore from "@/store/useBalance";
import { useFocusEffect } from "@react-navigation/native";
import useComplexHighScoreStore from "@/store/useComplexHighScore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const resetHighScores = useComplexHighScoreStore(
    (state) => state.resetHighScores
  );
  const soundVolume = useSoundVibrationStore((state) => state.soundVolume);
  const setSoundVolume = useSoundVibrationStore(
    (state) => state.setSoundVolume
  );
  const vibrationIntensity = useSoundVibrationStore(
    (state) => state.vibrationIntensity
  );
  const setVibrationIntensity = useSoundVibrationStore(
    (state) => state.setVibrationIntensity
  );

  const selectedBackground = useBackgroundStore(
    (state) => state.selectedBackground
  );
  const setSelectedBackground = useBackgroundStore(
    (state) => state.setSelectedBackground
  );
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const setSelectedLanguage = useLanguageStore(
    (state) => state.setSelectedLanguage
  );

  const resetBalance = useBalanceStore((state) => state.resetBalance);

  const languages = [
    { code: "EN", image: require("../assets/images/lan-en.png") },
    { code: "RU", image: require("../assets/images/lan-ru.png") },
    { code: "DE", image: require("../assets/images/lan-de.png") },
    { code: "TR", image: require("../assets/images/lan-tr.png") },
  ];

  const backgrounds = [
    { image: require("../assets/images/bg1.png") },
    { image: require("../assets/images/bg2.png") },
    { image: require("../assets/images/bg3.png") },
  ];

  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }, [])
  );

  return (
    <ImageBackground
      source={backgrounds[selectedBackground].image}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(11, 91, 145, 0.95)", "rgba(11, 91, 145, 0.95)"]}
        style={styles.gradient}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image source={require("../assets/images/go-home.png")} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{t("setting")}</Text>

      <View style={styles.sliderContainer}>
        <Text style={styles.optionTitle}>{t("sound")}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={soundVolume}
          onValueChange={setSoundVolume}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text style={styles.sliderValue}>{Math.round(soundVolume * 100)}%</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.optionTitle}>{t("vibration")}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={vibrationIntensity}
          onValueChange={setVibrationIntensity}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text style={styles.sliderValue}>
          {Math.round(vibrationIntensity * 100)}%
        </Text>
      </View>

      <Text style={styles.sectionTitle}>{t("language")}</Text>
      <View
        style={{
          flexDirection: "row",
          gap: 30,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {languages.map((lang, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedLanguage(lang.code)}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={lang.image}
              style={{
                width: 140 * (selectedLanguage === lang.code ? 0.4 : 0.3),
                height: 91 * (selectedLanguage === lang.code ? 0.4 : 0.3),
              }}
            />
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: selectedLanguage === lang.code ? "bold" : "normal",
              }}
            >
              {lang.code}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t("background")}</Text>
      <View style={styles.backgroundOptions}>
        {backgrounds.map((bg, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedBackground(index)}
            style={[
              styles.backgroundOption,
              selectedBackground === index && styles.selectedBackground,
            ]}
          >
            <Image
              source={bg.image}
              style={[
                styles.backgroundImage,
                selectedBackground === index && styles.selectedBackgroundImage,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            t("confirm_remove_data_title"),
            t("confirm_remove_data_message"),
            [
              {
                text: t("cancel"),
                style: "cancel",
              },
              {
                text: t("confirm"),
                onPress: async () => {
                  router.push("/webview");

                  setSelectedLanguage("EN");
                  setSoundVolume(0.5);
                  setVibrationIntensity(0.5);
                  resetBalance();

                  resetHighScores();

                  await AsyncStorage.removeItem("hasAcceptedPrivacyPolicy");

                  router.replace("/(tabs)");
                },
              },
            ]
          );
        }}
        style={styles.button}
      >
        <Image
          source={require("../assets/images/reset-score.png")}
          style={styles.buttonImage}
        />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    position: "absolute",
    top: 20,
    right: 10,
  },
  title: {
    fontFamily: "Montserrat",
    fontSize: 35,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  sliderContainer: {
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: {
    fontFamily: "Montserrat",
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    width: 90,
  },
  slider: {
    width: 250,
    alignSelf: "center",
  },
  sliderValue: {
    fontFamily: "Montserrat",
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    marginTop: 5,
  },
  sectionTitle: {
    fontFamily: "Montserrat",
    fontSize: 30,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    marginTop: 10,
  },
  backgroundOptions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  backgroundOption: {},
  selectedBackground: {
    borderColor: "yellow",
  },
  backgroundImage: {
    width: 70,
    height: 120,
    resizeMode: "cover",
    transform: [{ translateY: 20 }],
  },
  selectedBackgroundImage: {
    width: 90,
    height: 140,
    transform: [{ translateY: 10 }],
  },
  button: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    height: 125,
  },
  buttonImage: {
    width: 300,
    resizeMode: "contain",
  },
});
