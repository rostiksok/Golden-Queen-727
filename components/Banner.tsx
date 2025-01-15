import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

interface BannerProps {
  type: "victory" | "balance";
  text: string;
  textStart?: boolean;
}

const Banner: React.FC<BannerProps> = ({ type, text, textStart = true }) => {
  const { t } = useTranslation();
  const gradientColors =
    type === "victory" ? ["#7B4F19", "#DFB64E"] : ["#565656", "#AAAAAA"];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: gradientColors[0],
        },
      ]}
    >
      <Svg width="614" height="40" viewBox="0 0 614 40" style={styles.svg}>
        <Defs>
          <LinearGradient
            id="paint0_linear"
            x1="0"
            y1="53.8689"
            x2="403.763"
            y2="53.8689"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={gradientColors[0]} />
            <Stop offset="0.95" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>
        <Path
          d="M27.3563 0.368896H551.481H613.763L587.169 107.369H0.762695L27.3563 0.368896Z"
          fill="url(#paint0_linear)"
        />
      </Svg>
      <Text style={[styles.text, { [textStart ? "right" : "left"]: 170 }]}>
        {type === "victory" ? t("victory") : t("balance")}
        <Text style={styles.text2}> {text} </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  svg: {
    position: "absolute",
  },
  text: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  text2: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default Banner;
