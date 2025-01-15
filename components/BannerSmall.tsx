import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface BannerProps {
  type: "victory" | "balance";
  subtitle: string;
}

const Banner: React.FC<BannerProps> = ({ type, subtitle }) => {
  const { t } = useTranslation();
  const isVictory = type === "victory";

  const gradientColors = isVictory
    ? ["#7B4F19", "#DFB64E"]
    : ["#565656", "#AAAAAA"];

  const titleText = isVictory
    ? (t("victory") as string)
    : (t("balance") as string);

  return (
    <View style={styles.container}>
      <Svg
        width={137 * 0.8}
        height={67 * 0.7}
        viewBox="0 0 274 133"
        style={isVictory ? { left: 13 } : { right: 13 }}
      >
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>
        <Path
          d="M0.637303 132.467L32.9728 0.5H55.6823H272.523L240.188 132.467H0.637303Z"
          fill="url(#gradient)"
          stroke="#179DF8"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    position: "absolute",
    left: 20,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Montserrat-Regular",
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    lineHeight: 22,
    fontFamily: "Montserrat-Bold",
  },
});

export default Banner;
