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
  Alert,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import GradientButton from "@/components/GradientButton";
import Banner from "@/components/Banner";
import { Audio } from "expo-av";
import useBalanceStore from "@/store/useBalance";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import useSoundVibrationStore from "@/store/useSoundVibrationStore";

export default function Game1Screen() {
  const router = useRouter();
  const { t } = useTranslation();

  const slotIcons = [
    require("../assets/images/game1(slot)/slot-icon-1.png"),
    require("../assets/images/game1(slot)/slot-icon-2.png"),
    require("../assets/images/game1(slot)/slot-icon-3.png"),
    require("../assets/images/game1(slot)/slot-icon-4.png"),
    require("../assets/images/game1(slot)/slot-icon-5.png"),
    require("../assets/images/game1(slot)/slot-icon-6.png"),
  ];

  const [slotResult, setSlotResult] = useState(() =>
    Array(9)
      .fill(null)
      .map(() => Math.floor(Math.random() * slotIcons.length))
  );
  const [victory, setVictory] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [animatedResult, setAnimatedResult] = useState(slotResult);
  const [winningPositions, setWinningPositions] = useState<number[]>([]);

  const { soundVolume } = useSoundVibrationStore((state) => state);
  const balance = useBalanceStore((state) => state.balance);
  const addHighScore = useBalanceStore((state) => state.addHighScore);
  const incrementBalance = useBalanceStore((state) => state.incrementBalance);
  const decrementBalance = useBalanceStore((state) => state.decrementBalance);

  const bet = useBalanceStore((state) => state.bet);
  const incrementBet = useBalanceStore((state) => state.incrementBet);
  const decrementBet = useBalanceStore((state) => state.decrementBet);

  const spinValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const spinSound = useRef(new Audio.Sound());
  const winSound = useRef(new Audio.Sound());

  useEffect(() => {
    addHighScore("game1", undefined);

    (async () => {
      try {
        await spinSound.current.loadAsync(
          require("../assets/sounds/spin-sound.mp3")
        );
        await spinSound.current.setVolumeAsync(soundVolume);

        await winSound.current.loadAsync(
          require("../assets/sounds/slot-win-sound.mp3")
        );
        await winSound.current.setVolumeAsync(soundVolume);
      } catch (error) {
        console.error("Error loading sounds:", error);
      }
    })();

    return () => {
      spinSound.current.unloadAsync();
      winSound.current.unloadAsync();
    };
  }, [soundVolume]);

  useEffect(() => {
    if (isSpinning) {
      spinSound.current.replayAsync().catch((error) => {
        console.error("Error playing spin sound:", error);
      });
    } else {
      spinSound.current.stopAsync().catch((error) => {
        console.error("Error stopping spin sound:", error);
      });
    }
  }, [isSpinning]);

  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }, [])
  );

  const calculatePayoutMultiplier = (result: number[]) => {
    let multiplier = 0;
    const winPositions: number[] = [];

    const allSame = result.every(
      (iconIndex: number) => iconIndex === result[0]
    );
    if (allSame) {
      multiplier = 100;
      winPositions.push(...Array.from({ length: 9 }, (_, i) => i));
      setWinningPositions(winPositions);
      return multiplier;
    }

    const horizontals = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];
    horizontals.forEach((line) => {
      const [a, b, c] = line;
      if (result[a] === result[b] && result[b] === result[c]) {
        multiplier += 5;
        winPositions.push(...line);
      }
    });

    const verticals = [
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
    ];
    verticals.forEach((line) => {
      const [a, b, c] = line;
      if (result[a] === result[b] && result[b] === result[c]) {
        multiplier += 5;
        winPositions.push(...line);
      }
    });

    const diagonals = [
      [0, 4, 8],
      [2, 4, 6],
    ];
    diagonals.forEach((line) => {
      const [a, b, c] = line;
      if (result[a] === result[b] && result[b] === result[c]) {
        multiplier += 10;
        winPositions.push(...line);
      }
    });

    setWinningPositions(winPositions);
    return multiplier;
  };

  const spinSlots = () => {
    if (isSpinning) return;

    if (balance < bet) {
      Alert.alert(
        "Insufficient Balance",
        "You do not have enough balance to place this bet."
      );
      return;
    }

    setWinningPositions([]);
    setIsSpinning(true);

    const currentBet = bet;
    decrementBalance(currentBet);

    const newResult = Array(9)
      .fill(null)
      .map(() => Math.floor(Math.random() * slotIcons.length));

    setAnimatedResult(newResult);

    const numberOfSpins = 5;
    const spinDurationPerSpin = 500;
    const totalSpinDuration = spinDurationPerSpin * numberOfSpins;

    const delayBetweenColumns = 200;

    let completedAnimations = 0;

    spinValues.forEach((val, index) => {
      val.setValue(0);
      Animated.timing(val, {
        toValue: numberOfSpins,
        duration: totalSpinDuration,
        easing: Easing.linear,
        useNativeDriver: true,
        delay: index * delayBetweenColumns,
      }).start(({ finished }) => {
        if (finished) {
          completedAnimations += 1;

          if (completedAnimations === spinValues.length) {
            setSlotResult(newResult);
            const multiplier = calculatePayoutMultiplier(newResult);
            const win = currentBet * multiplier;
            setVictory(win);
            if (win > 0) {
              incrementBalance(win);
              addHighScore("game1", win);

              winSound.current.replayAsync().catch((error) => {
                console.error("Error playing win sound:", error);
              });
            }

            setIsSpinning(false);
          }
        }
      });
    });
  };

  const renderColumn = (colIndex: number) => {
    const indices = [colIndex, colIndex + 3, colIndex + 6];
    const iconsForColumn = indices.map((i) => slotIcons[animatedResult[i]]);

    const allIcons = [];
    const numberOfSpins = 10;
    for (let i = 0; i < numberOfSpins; i++) {
      allIcons.push(...iconsForColumn);
    }
    allIcons.push(...iconsForColumn);

    const iconContainerHeight = 80;

    const translateY = spinValues[colIndex].interpolate({
      inputRange: [0, numberOfSpins],
      outputRange: [
        0,
        -iconContainerHeight * iconsForColumn.length * numberOfSpins,
      ],
      extrapolate: "extend",
    });

    return (
      <View style={styles.columnContainer} key={colIndex}>
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
        >
          {allIcons.map((iconSource, i) => {
            const position = indices[i % 3];
            return (
              <View
                key={i}
                style={{
                  height: iconContainerHeight,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image source={iconSource} style={styles.slotIcon} />
                {winningPositions.includes(position) && (
                  <Image
                    source={require("../assets/images/game3/win.png")}
                    style={{
                      position: "absolute",
                      width: 110,
                      height: 110,
                    }}
                  />
                )}
              </View>
            );
          })}
        </Animated.View>
      </View>
    );
  };

  const isSpinDisabled = isSpinning || balance < bet;

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
        <View style={{ left: "19%", width: "20%" }}>
          <GradientButton
            title={t("highScore")}
            onPress={() =>
              router.push({
                pathname: "/high-score",
                params: { gameId: "game1" },
              })
            }
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
            <View style={{ flexDirection: "row", left: 65, bottom: 25 }}>
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
              <TouchableOpacity onPress={() => decrementBet(50)}>
                <Image
                  source={require("../assets/images/slot-minus.png")}
                  style={styles.buttonPlusMinusImage}
                />
              </TouchableOpacity>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 40,
                  fontWeight: "700",
                  fontStyle: "italic",
                  marginHorizontal: 20,
                }}
              >
                {bet}
              </Text>
              <TouchableOpacity onPress={() => incrementBet(50)}>
                <Image
                  source={require("../assets/images/slot-plus.png")}
                  style={styles.buttonPlusMinusImage}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isSpinDisabled && styles.buttonDisabled]}
              onPress={spinSlots}
              disabled={isSpinDisabled}
            >
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
    height: 240,
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
    top: 5,
    right: 10,
    bottom: 0,
    width: 300,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonImage: {
    top: 10,
    right: 22,
    height: 80,
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
