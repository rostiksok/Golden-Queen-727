import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function LoaderScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onFinish(); // Викликаємо функцію, коли завантаження завершено
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.percentageText}>{progress}%</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              height: (progress / 100) * 200, // Анімація висоти
            },
          ]}
        />
      </View>
      <Text style={styles.loadingText}>LOADING...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B5B91C2",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    width: 80,
    height: 200,
    backgroundColor: "#FFFFFF20",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBar: {
    width: "100%",
    backgroundColor: "#4CAFFF",
    position: "absolute",
    bottom: 0,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontStyle: "italic",
  },
});
