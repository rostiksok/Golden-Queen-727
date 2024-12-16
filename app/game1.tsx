import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ImageBackground,
  Image,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import GradientButton from "@/components/GradientButton";
import Banner from "@/components/Banner";

export default function Game1Screen() {
  const router = useRouter();

  const slotIcons = [
    require("../assets/images/game1(slot)/slot-icon-1.png"),
    require("../assets/images/game1(slot)/slot-icon-2.png"),
    require("../assets/images/game1(slot)/slot-icon-3.png"),
    require("../assets/images/game1(slot)/slot-icon-4.png"),
    require("../assets/images/game1(slot)/slot-icon-5.png"),
    require("../assets/images/game1(slot)/slot-icon-6.png"),
  ];

  // Ініціалізуємо поле випадковими іконками
  const [slotResult, setSlotResult] = useState(() =>
    Array(9)
      .fill(null)
      .map(() => Math.floor(Math.random() * slotIcons.length))
  );
  const [balance, setBalance] = useState(1000);
  const [victory, setVictory] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [animatedResult, setAnimatedResult] = useState(slotResult);

  // Три анімовані значення для трьох колонок
  const spinValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const calculatePayoutMultiplier = (result) => {
    let multiplier = 0;

    // Перевірка на всі однакові
    const allSame = result.every((iconIndex) => iconIndex === result[0]);
    if (allSame) {
      return 100;
    }

    // Горизонталі
    const horizontals = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];
    horizontals.forEach((line) => {
      const [a, b, c] = line;
      if (result[a] === result[b] && result[b] === result[c]) {
        multiplier += 5;
      }
    });

    // Вертикалі
    const verticals = [
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
    ];
    verticals.forEach((line) => {
      const [a, b, c] = line;
      if (result[a] === result[b] && result[b] === result[c]) {
        multiplier += 5;
      }
    });

    // Діагоналі
    const diagonals = [
      [0, 4, 8],
      [2, 4, 6],
    ];
    diagonals.forEach((line) => {
      const [a, b, c] = line;
      if (result[a] === result[b] && result[b] === result[c]) {
        multiplier += 10;
      }
    });

    return multiplier;
  };

  const spinSlots = () => {
    if (isSpinning) return; // Якщо вже крутиться, не запускаємо вдруге
    setIsSpinning(true);

    const bet = 100;
    setBalance((prev) => prev - bet);

    // Генеруємо кінцевий результат
    const newResult = Array(9)
      .fill(null)
      .map(() => Math.floor(Math.random() * slotIcons.length));

    const spinDuration = 1000;
    const delayBetweenColumns = 500;

    let completedAnimations = 0;

    spinValues.forEach((val, index) => {
      val.setValue(0);
      Animated.timing(val, {
        toValue: 1,
        duration: spinDuration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
        delay: index * delayBetweenColumns,
      }).start(({ finished }) => {
        if (finished) {
          completedAnimations += 1;

          // Коли всі анімації завершилися
          if (completedAnimations === spinValues.length) {
            // Оновлюємо кінцевий стан
            setSlotResult([...newResult]);
            const multiplier = calculatePayoutMultiplier(newResult);
            const win = bet * multiplier;
            setVictory(win);
            setBalance((prev) => prev + win);
            setIsSpinning(false);
          }
        }
      });
    });
  };

  const renderColumn = (colIndex) => {
    const indices = [colIndex, colIndex + 3, colIndex + 6];
    const iconsForColumn = indices.map((i) => slotIcons[slotResult[i]]);

    const allIcons = [...iconsForColumn, ...iconsForColumn];

    const iconContainerHeight = 80;
    const totalHeight = iconContainerHeight;

    const translateY = spinValues[colIndex].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -totalHeight / 2],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.columnContainer} key={colIndex}>
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
        >
          {allIcons.map((icon, i) => (
            <View
              key={i}
              style={{
                height: iconContainerHeight,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image source={icon} style={styles.slotIcon} />
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/images/bg1-horizontal.png")}
      style={styles.background}
    >
      <LinearGradient
        colors={["rgba(71, 38, 27, 0.88)", "rgba(71, 38, 27, 0)"]}
        style={styles.gradient}
      />
      <View style={styles.container}>
        <View style={{ left: "23%" }}>
          <GradientButton
            title="High score"
            onPress={() => router.push("/setting-screen")}
          />
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.slotContainer}>
            <Image
              source={require("../assets/images/slot-arrea.png")}
              style={styles.slotArreaImage}
            />
            <View style={styles.slotsGrid}>
              <View style={styles.rowForColumns}>
                {renderColumn(0)}
                {renderColumn(1)}
                {renderColumn(2)}
              </View>
            </View>
          </View>

          <View>
            <View style={{ flexDirection: "row", left: 130 }}>
              <TouchableOpacity onPress={() => router.push("/")}>
                <Image
                  source={require("../assets/images/go-home.png")}
                  style={styles.goButton}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/setting-screen")}>
                <Image
                  source={require("../assets/images/go-settings.png")}
                  style={styles.goButton}
                />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 15 }}>
              <View style={{ left: 190, marginBottom: 10 }}>
                <Banner type="victory" text={`${victory}`} />
              </View>
              <View style={{ right: 190 }}>
                <Banner type="balance" text={`${balance}`} textStart={false} />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../assets/images/slot-plus.png")}
                style={styles.buttonPlusMinusImage}
              />
              <Text style={{ color: "#fff" }}>100</Text>
              <Image
                source={require("../assets/images/slot-minus.png")}
                style={styles.buttonPlusMinusImage}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={spinSlots}>
              <Image
                source={require("../assets/images/play-button.png")}
                style={styles.buttonImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    top: -20,
    left: 20,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  slotArreaImage: {
    height: 876 * 0.35,
    width: 1241 * 0.35,
    zIndex: 1,
    resizeMode: "contain",
  },
  slotContainer: {
    position: "relative",
  },
  slotsGrid: {
    position: "absolute",
    top: "13%",
    left: "5%",
    width: "90%",
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  rowForColumns: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  columnContainer: {
    width: "33%",
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  slotIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    zIndex: 1,
  },
  button: {
    bottom: 0,
    width: 300,
    alignItems: "center",
  },
  buttonImage: {
    width: 200,
    height: 70,
    resizeMode: "contain",
  },
  goButton: {
    width: 173 * 0.4,
    height: 132 * 0.4,
  },
  buttonPlusMinusImage: {
    width: 173 * 0.4,
    height: 132 * 0.4,
  },
});
