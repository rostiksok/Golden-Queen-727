// components/HeaderBar.tsx
import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import Banner from "./BannerSmall";
import GradientButton from "./GradientButton";

interface HeaderBarProps {
  score?: number;
  balance?: number;
  highScore?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ score, balance, highScore }) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push("/")}>
        <Image
          source={require("../assets/images/go-home.png")}
          style={styles.goButton}
        />
      </TouchableOpacity>

      {highScore !== undefined && (
        <GradientButton
          title="High score"
          onPress={() =>
            router.push({
              pathname: "/high-score",
              params: { gameId: highScore },
            })
          }
        />
      )}

      {score !== undefined && balance !== undefined && (
        <View style={styles.infoPanel}>
          <View style={styles.infoBlock}>
            <Banner type="victory" subtitle={`${score}`} />
          </View>
          <View style={styles.infoBlock}>
            <Banner type="balance" subtitle={`${balance}`} />
          </View>
        </View>
      )}

      <TouchableOpacity onPress={() => router.push("/setting-screen")}>
        <Image
          source={require("../assets/images/go-settings.png")}
          style={styles.goButton}
        />
      </TouchableOpacity>
    </View>
  );
};

export default HeaderBar;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  goButton: {
    zIndex: 100,
    width: 173 * 0.4,
    height: 132 * 0.4,
    resizeMode: "contain",
  },
  infoPanel: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  infoBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
});
