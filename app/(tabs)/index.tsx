import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

export default function WelcomeScreen() {
  const router = useRouter();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <ImageBackground
      source={require("../../assets/images/welcome-bg.png")}
      style={styles.container}
    >
      <Animated.Image
        source={require("../../assets/images/logo.png")}
        style={[styles.logo, { opacity: fadeAnim }]}
      />

      <TouchableOpacity
        onPress={() => router.push("/game-selection")}
        style={styles.button}
      >
        <Animated.Image
          source={require("../../assets/images/game-btn.png")}
          style={[styles.buttonImage, { transform: [{ scale: scaleAnim }] }]} // застосовуємо анімацію пульсації
        />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    position: "absolute",
    top: 5,
  },
  button: {
    position: "absolute",
    bottom: 0,
    width: 300,
    alignItems: "center",
  },
  buttonImage: {
    width: 300,
    resizeMode: "contain",
  },
});
