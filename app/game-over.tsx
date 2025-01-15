import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import GradientButton from "@/components/GradientButton";
import Banner from "@/components/Banner";

export default function GameOverScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Banner type="victory" text={`Victory`} />
      <Text style={styles.gameOverText}>Your balance: points</Text>
      <GradientButton title="Restart" onPress={() => router.push("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e74c3c",
  },
  gameOverText: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
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
});
