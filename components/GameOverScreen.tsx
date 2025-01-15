import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import HeaderBar from "./Header";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import useBackgroundStore from "@/store/useBackground";

interface GameOverScreenProps {
  score?: number;
  win?: boolean;
}

export default function GameOverScreen({ score, win }: GameOverScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const backgrounds = [
    { image: require("../assets/images/bg1.png") },
    { image: require("../assets/images/bg2.png") },
    { image: require("../assets/images/bg3.png") },
  ];

  const selectedBackground = useBackgroundStore(
    (state) => state.selectedBackground
  );

  return (
    <ImageBackground
      source={backgrounds[selectedBackground].image}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(71, 38, 27, 0.88)", "rgba(71, 38, 27, 0)"]}
        style={styles.gradient}
      />
      <View style={styles.gameOverOverlay}>
        <HeaderBar highScore="game2" />

        <Image
          source={require("../assets/images/game-over-area.png")}
          style={{
            justifyContent: "center",
            width: 1241 * 0.35,
            height: 876 * 0.35,
            alignItems: "center",
            position: "absolute",
          }}
        />

        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 40,
              position: "absolute",
              fontFamily: "Futura URW Extra Bold",
              top: 0,
            }}
          >
            {!win ? t("tryAgain") : t("victory")}
          </Text>

          <Image
            source={
              win
                ? require("../assets/images/game3/win-piramide.png")
                : require("../assets/images/game3/try-again-piramide.png")
            }
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              resizeMode: "contain",
              position: "absolute",
              top: 35,
            }}
          />
          <Text style={styles.gameOverText}>{score || 0}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/game2")}>
          <Image
            source={
              win
                ? require("../assets/images/game3/continue.png")
                : require("../assets/images/game3/restart.png")
            }
            style={{
              width: 494 * 0.3,
              height: 192 * 0.3,
              marginTop: 30,
              position: "relative",
            }}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(71, 38, 27, 0.88)",
  },
  gameOverText: {
    left: "0.5%",
    fontSize: 32,
    color: "#fff",
    top: "20%",
    backgroundColor: "rgba(28, 18, 25, 1)",
    padding: 10,
    fontFamily: "Futura URW Extra Bold",
  },
  restartButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  restartButtonText: {
    fontSize: 18,
    color: "#3498db",
    fontWeight: "bold",
  },
  gameOverOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
