// GameSelectionScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import HeaderBar from "@/components/Header";
import useSoundVibrationStore from "@/store/useSoundVibrationStore";

type Game = {
  id: number;
  image: any;
  route: string;
};

export default function GameSelectionScreen() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  // Використовуємо useRef для зберігання звуків
  const selectSoundRef = useRef<Audio.Sound | null>(null);
  const playSoundRef = useRef<Audio.Sound | null>(null);

  // Отримуємо soundVolume з глобального стану
  const soundVolume = useSoundVibrationStore((state) => state.soundVolume);
  const vibrationIntensity = useSoundVibrationStore(
    (state) => state.vibrationIntensity
  );

  const leftGames: Game[] = [
    { id: 1, image: require("../assets/images/game1.png"), route: "/game1" },
    { id: 3, image: require("../assets/images/game3.png"), route: "/game3" },
  ];

  const rightGames: Game[] = [
    { id: 2, image: require("../assets/images/game2.png"), route: "/game2" },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadSounds = async () => {
      try {
        // Встановлюємо режим для відтворення звуку
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Завантажуємо звук для вибору (selectSound)
        const { sound: selectSound } = await Audio.Sound.createAsync(
          require("../assets/sounds/select-sound.mp3"),
          { volume: soundVolume } // Встановлюємо гучність при завантаженні
        );
        if (isMounted) {
          selectSoundRef.current = selectSound;
          console.log("Select sound loaded");
        }

        // Завантажуємо звук для Play (playSoundEffect)
        const { sound: playSound } = await Audio.Sound.createAsync(
          require("../assets/sounds/select-sound.mp3"),
          { volume: soundVolume } // Встановлюємо гучність при завантаженні
        );
        if (isMounted) {
          playSoundRef.current = playSound;
          console.log("Play sound loaded");
        }
      } catch (error) {
        console.error("Error loading sounds:", error);
      }
    };

    loadSounds();

    return () => {
      // Коли компонент демонтується, розвантажуємо звуки
      isMounted = false;
      if (selectSoundRef.current) {
        selectSoundRef.current.unloadAsync();
      }
      if (playSoundRef.current) {
        playSoundRef.current.unloadAsync();
      }
    };
  }, [soundVolume]); // Додаємо soundVolume як залежність

  // Оновлюємо гучність звуків при зміні soundVolume
  useEffect(() => {
    const updateSoundVolume = async () => {
      try {
        if (selectSoundRef.current) {
          await selectSoundRef.current.setVolumeAsync(soundVolume);
        }
        if (playSoundRef.current) {
          await playSoundRef.current.setVolumeAsync(soundVolume);
        }
      } catch (error) {
        console.error("Error updating sound volume:", error);
      }
    };

    updateSoundVolume();
  }, [soundVolume]);

  const playSelectSound = async () => {
    if (selectSoundRef.current) {
      try {
        await selectSoundRef.current.replayAsync();
        console.log("Select sound played");
      } catch (error) {
        console.error("Error playing select sound:", error);
      }
    }
  };

  const playPlaySound = async () => {
    if (playSoundRef.current) {
      try {
        await playSoundRef.current.replayAsync();
        console.log("Play sound played");
      } catch (error) {
        console.error("Error playing play sound:", error);
      }
    }
  };

  const handleGameSelect = (gameId: number) => {
    setSelectedGame(gameId);
    playSelectSound();
  };

  const handlePlay = () => {
    if (selectedGame !== null) {
      const allGames = leftGames.concat(rightGames);
      const game = allGames.find((game) => game.id === selectedGame);

      if (game) {
        playPlaySound();
        router.push(game.route as any);
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/game-bg.png")}
      style={styles.container}
    >
      <HeaderBar />

      <View style={styles.gamesRow}>
        <View style={styles.leftGamesContainer}>
          {leftGames.map((game) => (
            <TouchableOpacity
              key={game.id}
              onPress={() => handleGameSelect(game.id)}
            >
              <View style={{ pointerEvents: "none" }}>
                <Image source={game.image} style={styles.gameImage} />
                {selectedGame === game.id && (
                  <Image
                    source={require("../assets/images/glitter.png")}
                    style={styles.glitterImage}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rightGamesContainer}>
          {rightGames.map((game) => (
            <TouchableOpacity
              key={game.id}
              onPress={() => handleGameSelect(game.id)}
            >
              <View style={{ pointerEvents: "none" }}>
                <Image source={game.image} style={styles.gameImage} />
                {selectedGame === game.id && (
                  <Image
                    source={require("../assets/images/glitter.png")}
                    style={styles.glitterImage}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={handlePlay}
        style={styles.button}
        disabled={selectedGame === null}
      >
        <Image
          source={require("../assets/images/play-btn.png")}
          style={styles.buttonImage}
        />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  gamesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: "100%",
    width: "90%",
    alignItems: "center",
  },
  leftGamesContainer: {
    flexDirection: "column",
    right: 60,
    bottom: 80,
  },
  rightGamesContainer: {
    right: "30%",
    bottom: "10%",
  },
  gameImage: {
    width: 260,
    height: 250,
  },
  glitterImage: {
    position: "absolute",
    top: -275,
    left: -270,
    width: 800,
    height: 800,
    resizeMode: "contain",
    zIndex: -1,
  },
  button: {
    position: "absolute",
    bottom: 0,
    width: 300,
    alignItems: "center",
  },
  buttonImage: {
    width: 350,
    resizeMode: "contain",
  },
});
