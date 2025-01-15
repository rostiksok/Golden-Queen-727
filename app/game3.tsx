import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  ImageSourcePropType,
  Easing,
  NativeTouchEvent,
  Vibration,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRouter } from "expo-router";
import MySvgComponent from "@/components/Par";
import useBalanceStore from "@/store/useBalance";
import HeaderBar from "@/components/Header";
import GradientButton from "@/components/GradientButton";
import { useTranslation } from "react-i18next";
import useSoundVibrationStore from "@/store/useSoundVibrationStore";

const { width, height } = Dimensions.get("window");
const ICON_SIZE = 80;

type FallingIcon = {
  id: number | string;
  source: ImageSourcePropType;
  value: number;
  deadly: boolean;
  animatedValue: Animated.Value;
  opacityValue: Animated.Value;
  rotateDeg: number;
  xPos: number;
  glowScale: Animated.Value;
  pressed: boolean;
};

const ICONS = [
  { source: require("../assets/images/game3/1.png"), value: 1, deadly: false },
  { source: require("../assets/images/game3/2.png"), value: 0, deadly: true },
  { source: require("../assets/images/game3/3.png"), value: 2, deadly: false },
  { source: require("../assets/images/game3/4.png"), value: 0, deadly: true },
  { source: require("../assets/images/game3/5.png"), value: 5, deadly: false },
  { source: require("../assets/images/game3/6.png"), value: 7, deadly: false },
  { source: require("../assets/images/game3/7.png"), value: 5, deadly: false },
  { source: require("../assets/images/game3/8.png"), value: 10, deadly: false },
  { source: require("../assets/images/game3/9.png"), value: 0, deadly: true },
];

export default function GameScreen() {
  const { t } = useTranslation();

  const router = useRouter();

  const balance = useBalanceStore((state) => state.balance);
  const bet = useBalanceStore((state) => state.bet);
  const addHighScore = useBalanceStore((state) => state.addHighScore);

  const incrementBet = useBalanceStore((state) => state.incrementBet);
  const decrementBet = useBalanceStore((state) => state.decrementBet);
  const incrementBalance = useBalanceStore((state) => state.incrementBalance);
  const decrementBalance = useBalanceStore((state) => state.decrementBalance);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [fallingIcons, setFallingIcons] = useState<FallingIcon[]>([]);
  const [visibleArrea, setVisibleArrea] = useState(true);

  const gameTimerRef = useRef<number | null>(null);
  const iconSpawnerRef = useRef<number | null>(null);

  const vibrationIntensity = useSoundVibrationStore(
    (state) => state.vibrationIntensity
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    return () => {
      if (gameTimerRef.current !== null) clearInterval(gameTimerRef.current);
      if (iconSpawnerRef.current !== null)
        clearInterval(iconSpawnerRef.current);
    };
  }, [gameOver]);

  useEffect(() => {
    for (let i = 0; i < 20; i++) {
      addHighScore("game3", 100 * i);
    }
  }, []);

  const triggerVibration = () => {
    const intensity = Math.max(0, Math.min(1, vibrationIntensity));

    const vibrationDuration = 100 + intensity * 400;
    const pauseDuration = 50 + intensity * 200;

    const pattern = [
      0,
      vibrationDuration,
      pauseDuration,
      vibrationDuration,
      pauseDuration,
    ];

    Vibration.vibrate(pattern, false);
  };

  const startGame = () => {
    if (gameOver) return;
    setVisibleArrea(false);
    setScore(0);
    setTimeLeft(60);
    setFallingIcons([]);

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (gameTimerRef.current !== null)
            clearInterval(gameTimerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;

    iconSpawnerRef.current = setInterval(() => {
      spawnIcons(1);
    }, 500) as unknown as number;
  };

  const endGame = () => {
    setGameOver(true);
    if (iconSpawnerRef.current !== null) clearInterval(iconSpawnerRef.current);

    if (score < bet) {
      decrementBalance(bet);
    }
    setVisibleArrea(true);
    setTimeLeft(60);
  };

  const spawnIcons = (count = 1) => {
    if (gameOver) return;

    let newIcons: FallingIcon[] = [];
    for (let i = 0; i < count; i++) {
      const xPos = Math.random() * (width - ICON_SIZE);
      const newIcon = createIcon(xPos);
      newIcons.push(newIcon);

      Animated.parallel([
        Animated.timing(newIcon.animatedValue, {
          toValue: height,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(newIcon.opacityValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setFallingIcons((prev) =>
            prev.filter((ic) => ic.id !== newIcon.id || ic.pressed)
          );
        }
      });
    }

    setFallingIcons((prev) => [...prev, ...newIcons]);
  };

  const createIcon = (xPos: number): FallingIcon => {
    const randomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];
    const animatedValue = new Animated.Value(-10);
    const opacityValue = new Animated.Value(0);
    const glowScale = new Animated.Value(1);
    const randomRotate = Math.random() * 20 - 10;
    return {
      id: Date.now() + Math.random(),
      source: randomIcon.source,
      value: randomIcon.value,
      deadly: randomIcon.deadly,
      animatedValue,
      opacityValue,
      rotateDeg: randomRotate,
      xPos,
      glowScale,
      pressed: false,
    };
  };

  const handleIconPress = (icon: FallingIcon, event: NativeTouchEvent) => {
    if (icon.deadly) {
      endGame();
    } else {
      setScore((prev) => {
        const newScore = prev + icon.value;

        if (newScore >= bet && !gameOver) {
          incrementBalance(bet * 2);
          addHighScore("game3", bet);
          endGame();
        }

        return newScore;
      });
    }

    triggerVibration();

    setFallingIcons((prev) =>
      prev.map((i) => (i.id === icon.id ? { ...i, pressed: true } : i))
    );

    const pressedIcon = fallingIcons.find((i) => i.id === icon.id);
    if (!pressedIcon) return;

    Animated.sequence([
      Animated.timing(pressedIcon.glowScale, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pressedIcon.glowScale, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFallingIcons((prev) => prev.filter((i) => i.id !== icon.id));
    });
  };

  const handleRestart = () => {
    setGameOver(false);
    startGame();
  };

  const handleIncreaseBet = () => {
    incrementBet(10);
  };

  const handleDecreaseBet = () => {
    decrementBet(10);
  };

  return (
    <ImageBackground
      source={require("../assets/images/game3/bg.png")}
      style={styles.container}
    >
      <HeaderBar score={score} balance={balance} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            left: "37%",
          }}
        >
          <GradientButton
            title={t("highScore")}
            onPress={() =>
              router.push({
                pathname: "/high-score",
                params: { gameId: "game3" },
              })
            }
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Image
            source={require("../assets/images/game3/timer.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={styles.infoText}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: "space-between", width: "100%" }}>
        {fallingIcons.map((icon) => {
          return (
            <Animated.View
              key={icon.id}
              style={{
                position: "absolute",
                top: 0,
                left: icon.xPos,
                transform: [
                  { translateY: icon.animatedValue },
                  { rotate: `${icon.rotateDeg}deg` },
                ],
                opacity: icon.opacityValue,
              }}
              pointerEvents={icon.pressed ? "none" : "auto"}
            >
              <TouchableOpacity
                onPress={(e) => handleIconPress(icon, e.nativeEvent)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: icon.glowScale }],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={icon.source}
                    style={{
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                    }}
                  />
                  {icon.pressed && (
                    <>
                      <Image
                        source={require("../assets/images/game3/win.png")}
                        style={{
                          position: "absolute",
                          width: ICON_SIZE * 2,
                          height: ICON_SIZE * 2,
                          zIndex: -1,
                        }}
                      />
                      <Text
                        style={{
                          color: "yellow",
                          fontWeight: "bold",
                          fontSize: 20,
                          zIndex: 1,
                        }}
                      >
                        +{icon.value}
                      </Text>
                    </>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      {visibleArrea && (
        <>
          <TouchableOpacity onPress={startGame} style={styles.button}>
            <Image
              source={require("../assets/images/play-btn.png")}
              style={styles.buttonImage}
            />
          </TouchableOpacity>

          <MySvgComponent
            displayText={`${bet}`}
            leftIconHandler={handleDecreaseBet}
            rightIconHandler={handleIncreaseBet}
          />
        </>
      )}

      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <HeaderBar />
          <ImageBackground
            source={require("../assets/images/game3/game-over.png")}
            style={{
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
              width: 876 * 0.37,
              height: 1241 * 0.37,
            }}
          >
            <View
              style={{
                width: "90%",
                height: "90%",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                marginTop: 45,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 40,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {score >= bet
                  ? (t("victory") as string)
                  : (t("tryAgain") as string)}
              </Text>

              <ImageBackground
                source={
                  score >= bet
                    ? require("../assets/images/game3/win-piramide.png")
                    : require("../assets/images/game3/try-again-piramide.png")
                }
                style={{
                  width: "100%",
                  height: "80%",
                  justifyContent: "center",
                  alignItems: "center",
                  right: 6,
                }}
              >
                <Text style={styles.gameOverText}>{score}</Text>
              </ImageBackground>
            </View>
          </ImageBackground>
          <TouchableOpacity onPress={handleRestart}>
            <Image
              source={
                score >= bet
                  ? require("../assets/images/game3/continue.png")
                  : require("../assets/images/game3/restart.png")
              }
              style={{
                width: 494 * 0.4,
                height: 192 * 0.4,
                marginTop: 20,
              }}
            />
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
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
  infoText: {
    fontSize: 16,
    color: "white",
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
    marginBottom: 70,
  },
  gameOverOverlay: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(71, 38, 27, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  gameOverText: {
    fontSize: 28,
    marginBottom: 60,
    textAlign: "center",
    fontWeight: "bold",
    fontStyle: "italic",
    backgroundColor: "rgba(28, 18, 25, 1)",
    padding: 15,
    color: "rgba(255, 198, 69, 1)",
    left: 10,
  },
});
