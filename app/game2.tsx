import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  View,
  TouchableOpacity,
  Vibration,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import GradientButton from "@/components/GradientButton";
import Banner from "@/components/Banner";
import GameOverScreen from "@/components/GameOverScreen";
import Parallelogram from "@/components/Paralelogram";

import useLanguageStore from "@/store/useLanguage";
import useBalanceStore from "@/store/useBalance";
import useComplexHighScoreStore from "@/store/useComplexHighScore";
import useSoundVibrationStore from "@/store/useSoundVibrationStore";

import quizEn from "../assets/quizzes/quiz_en.json";
import quizRu from "../assets/quizzes/quiz_ru.json";
import quizDe from "../assets/quizzes/quiz_de.json";
import quizTr from "../assets/quizzes/quiz_tr.json";

interface Question {
  question: string;
  options: string[];
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}
interface QuestionNumberIndicatorProps {
  currentQuestionIndex: number;
  temporaryScores: { [key: number]: boolean };
}

const getQuizDataByLanguage = (language: string) => {
  switch (language) {
    case "RU":
      return quizRu;
    case "DE":
      return quizDe;
    case "TR":
      return quizTr;
    default:
      return quizEn;
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const QuestionNumberIndicator: React.FC<
  QuestionNumberIndicatorProps & {
    totalQuestions: number;
  }
> = ({ currentQuestionIndex, temporaryScores, totalQuestions }) => {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: totalQuestions }, (_, index) => {
        const isActive = currentQuestionIndex === index;
        return (
          <View key={index} style={styles.indicatorWrapper}>
            <Parallelogram
              width={50 * 0.65}
              height={40 * 0.65}
              text={index + 1}
              isActive={isActive}
              isAnswered={temporaryScores[index] !== undefined}
            />
            {temporaryScores[index] && (
              <Text style={styles.scoreText}>+{(index + 1) * 100}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default function GameScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { selectedLanguage } = useLanguageStore();
  const [quizData, setQuizData] = useState(() =>
    getQuizDataByLanguage(selectedLanguage)
  );
  useEffect(() => {
    setQuizData(getQuizDataByLanguage(selectedLanguage));
  }, [selectedLanguage]);

  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      return () => {
        ScreenOrientation.unlockAsync();
      };
    }, [])
  );

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [temporaryScores, setTemporaryScores] = useState<{
    [key: number]: boolean;
  }>({});
  const [scoreSaved, setScoreSaved] = useState(false);

  const [balance, setBalance] = useState(0);
  const [currentRoundPoints, setCurrentRoundPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [callUsed, setCallUsed] = useState(false);
  const [hallUsed, setHallUsed] = useState(false);

  const [fiftyFiftyAppliedQuestion, setFiftyFiftyAppliedQuestion] = useState<
    number | null
  >(null);
  const [callHint, setCallHint] = useState<string | null>(null);
  const [hallDistribution, setHallDistribution] = useState<number[] | null>(
    null
  );

  const { incrementBalance } = useBalanceStore();
  const { incrementTotalWins, incrementTotalAttempts, addHighScore } =
    useComplexHighScoreStore();

  const soundVolume = useSoundVibrationStore((state) => state.soundVolume);
  const vibrationIntensity = useSoundVibrationStore(
    (state) => state.vibrationIntensity
  );
  const gameOverSound = useRef(new Audio.Sound());
  const rightAnswerSound = useRef(new Audio.Sound());
  const winSound = useRef(new Audio.Sound());

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await gameOverSound.current.loadAsync(
          require("../assets/sounds/game-over-lose.mp3"),
          { volume: soundVolume }
        );
        await rightAnswerSound.current.loadAsync(
          require("../assets/sounds/right-answer.mp3"),
          { volume: soundVolume }
        );
        await winSound.current.loadAsync(
          require("../assets/sounds/win-victoryna.mp3"),
          { volume: soundVolume }
        );
      } catch (error) {
        console.error("Error loading sounds:", error);
      }
    };
    loadSounds();

    return () => {
      gameOverSound.current.unloadAsync();
      rightAnswerSound.current.unloadAsync();
      winSound.current.unloadAsync();
    };
  }, [soundVolume]);

  useEffect(() => {
    const updateSoundVolume = async () => {
      try {
        await gameOverSound.current.setVolumeAsync(soundVolume);
        await rightAnswerSound.current.setVolumeAsync(soundVolume);
        await winSound.current.setVolumeAsync(soundVolume);
      } catch (error) {
        console.error("Error updating sound volume:", error);
      }
    };
    updateSoundVolume();
  }, [soundVolume]);

  const playSound = async (soundRef: React.MutableRefObject<Audio.Sound>) => {
    try {
      await soundRef.current.replayAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  useEffect(() => {
    const prepareQuestions = () => {
      try {
        const rawQuestions: Question[] = quizData.quiz.flatMap(
          (category: any) =>
            category.questions.map((q: any) => ({
              question: q.question,
              options: q.options,
              answer: q.answer,
              difficulty: q.difficulty,
            }))
        );

        const validQuestions = rawQuestions.filter(
          (q) =>
            q.question &&
            Array.isArray(q.options) &&
            q.answer &&
            ["Easy", "Medium", "Hard"].includes(q.difficulty)
        );

        const easyQuestions = validQuestions.filter(
          (q) => q.difficulty === "Easy"
        );
        const mediumQuestions = validQuestions.filter(
          (q) => q.difficulty === "Medium"
        );
        const hardQuestions = validQuestions.filter(
          (q) => q.difficulty === "Hard"
        );

        const shuffledEasy = shuffleArray(easyQuestions);
        const shuffledMedium = shuffleArray(mediumQuestions);
        const shuffledHard = shuffleArray(hardQuestions);

        const selectedEasy = shuffledEasy.slice(0, 4);
        const selectedMedium = shuffledMedium.slice(0, 3);
        const selectedHard = shuffledHard.slice(0, 3);

        const finalQuestionOrder = [
          ...selectedEasy,
          ...selectedMedium,
          ...selectedHard,
        ];

        setAllQuestions(finalQuestionOrder);
      } catch (error) {
        console.error("Error preparing questions:", error);
      }
    };

    prepareQuestions();
  }, [quizData]);

  const currentQuestion = allQuestions[currentQuestionIndex];

  const handleOptionSelect = (option: string) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.answer;
    const pointsEarned = isCorrect ? (currentQuestionIndex + 1) * 100 : 0;

    if (isCorrect) {
      playSound(rightAnswerSound);
      setBalance((prev) => prev + pointsEarned);
      setCurrentRoundPoints(pointsEarned);

      setTemporaryScores((prev) => ({ ...prev, [currentQuestionIndex]: true }));
      setTimeout(() => {
        setTemporaryScores((prev) => {
          const updated = { ...prev };
          delete updated[currentQuestionIndex];
          return updated;
        });
      }, 1000);

      if (currentQuestionIndex + 1 === allQuestions.length) {
        setGameWon(true);
        playSound(winSound);
      }
    } else {
      setGameOver(true);
      playSound(gameOverSound);

      Vibration.vibrate(
        [0, 500 * vibrationIntensity, 200 * vibrationIntensity],
        false
      );
    }

    addHighScore("game2", currentQuestion.difficulty, isCorrect, pointsEarned);
  };

  const handleNextQuestion = () => {
    if (gameOver || gameWon) return;

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setCurrentRoundPoints(0);

      setCallHint(null);
      setHallDistribution(null);
      setFiftyFiftyAppliedQuestion(null);
    } else {
      setGameWon(true);
      playSound(winSound);
    }
  };

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || !currentQuestion) return;
    setFiftyFiftyUsed(true);
    setFiftyFiftyAppliedQuestion(currentQuestionIndex);
  };

  const handleCallHelp = () => {
    if (callUsed || !currentQuestion) return;
    setCallUsed(true);

    const correctAnswer = currentQuestion.answer;
    const allOptions = currentQuestion.options;
    const incorrectOptions = allOptions.filter((o) => o !== correctAnswer);

    const randomNumber = Math.floor(Math.random() * 5);
    if (randomNumber !== 4) {
      setCallHint(correctAnswer);
    } else {
      const randomIncorrect = shuffleArray([...incorrectOptions])[
        Math.floor(Math.random() * incorrectOptions.length)
      ];
      setCallHint(randomIncorrect);
    }
  };

  const handleHallHelp = () => {
    if (hallUsed || !currentQuestion) return;
    setHallUsed(true);

    const correctAnswer = currentQuestion.answer;
    const allOptions = currentQuestion.options;
    const incorrectOptions = allOptions.filter((o) => o !== correctAnswer);

    const correctPercent = Math.floor(Math.random() * 21) + 40;
    let remaining = 100 - correctPercent;
    const distributions: number[] = [];

    for (let i = 0; i < incorrectOptions.length; i++) {
      if (i === incorrectOptions.length - 1) {
        distributions.push(remaining);
      } else {
        const part = Math.floor(
          Math.random() * (remaining - (incorrectOptions.length - i - 1))
        );
        distributions.push(part);
        remaining -= part;
      }
    }

    const hallArray = allOptions.map((opt) =>
      opt === correctAnswer ? correctPercent : distributions.shift() || 0
    );
    setHallDistribution(hallArray);
  };

  useEffect(() => {
    if (gameOver) {
      playSound(gameOverSound);
    }
  }, [gameOver]);

  useEffect(() => {
    if (gameWon) {
      playSound(winSound);
    }
  }, [gameWon]);

  if (gameOver) {
    if (!scoreSaved && currentQuestion) {
      addHighScore("game2", currentQuestion.difficulty, false, balance);
      incrementTotalAttempts();
      setScoreSaved(true);
    }
    return <GameOverScreen />;
  }

  if (gameWon) {
    if (!scoreSaved && currentQuestion) {
      addHighScore("game2", currentQuestion.difficulty, true, balance);
      incrementBalance(balance);
      incrementTotalAttempts();
      incrementTotalWins();
      setScoreSaved(true);
    }
    return <GameOverScreen score={balance} win />;
  }

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Завантаження питань...</Text>
      </View>
    );
  }

  let displayedOptions = currentQuestion.options || [];
  if (fiftyFiftyUsed && fiftyFiftyAppliedQuestion === currentQuestionIndex) {
    const { answer } = currentQuestion;
    const incorrectOptions = currentQuestion.options.filter(
      (opt) => opt !== answer
    );

    if (incorrectOptions.length > 1) {
      const randomIncorrect = shuffleArray([...incorrectOptions]).slice(0, 1);
      displayedOptions = [answer, ...randomIncorrect];
    } else {
      displayedOptions = [answer, ...incorrectOptions];
    }
    displayedOptions = shuffleArray(displayedOptions);
  }

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
        <View style={styles.rowContainer}>
          <QuestionNumberIndicator
            currentQuestionIndex={currentQuestionIndex}
            temporaryScores={temporaryScores}
            totalQuestions={allQuestions.length}
          />

          <Image
            source={require("../assets/images/milioner.png")}
            style={styles.millionerImage}
          />

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            <View style={styles.optionsContainer}>
              {displayedOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === option
                      ? option === currentQuestion.answer
                        ? styles.correctOption
                        : styles.incorrectOption
                      : null,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                >
                  <View style={styles.optionButtonRow}>
                    <Text style={styles.optionText}>{option}</Text>

                    {callHint && callHint === option && (
                      <Text
                        style={styles.callHintText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        (Call hint suggests this)
                      </Text>
                    )}

                    {hallDistribution && (
                      <Text
                        style={styles.hallDistributionText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {hallDistribution[index]}%
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
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

            <View
              style={{
                flexDirection: "row",
                left: 130,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <GradientButton
                title={t("highScore")}
                onPress={() =>
                  router.push({
                    pathname: "/high-score",
                    params: { gameId: "game2" },
                  })
                }
              />
            </View>

            <View style={{ flexDirection: "row", left: 19, marginBottom: 10 }}>
              <TouchableOpacity
                disabled={fiftyFiftyUsed}
                onPress={handleFiftyFifty}
              >
                <Image
                  source={require("../assets/images/help-50-50.png")}
                  style={fiftyFiftyUsed && styles.nextButtonDisabled}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCallHelp} disabled={callUsed}>
                <Image
                  source={require("../assets/images/help-call.png")}
                  style={callUsed && styles.nextButtonDisabled}
                />
              </TouchableOpacity>
              <TouchableOpacity disabled={hallUsed} onPress={handleHallHelp}>
                <Image
                  source={require("../assets/images/help-from-the-hall.png")}
                  style={hallUsed && styles.nextButtonDisabled}
                />
              </TouchableOpacity>
            </View>

            <View style={{ left: 135, marginBottom: 15 }}>
              <View style={{ left: 14, marginBottom: 10 }}>
                <Banner type="victory" text={`${currentRoundPoints}`} />
              </View>
              <Banner type="balance" text={`${balance}`} />
            </View>

            <TouchableOpacity
              onPress={handleNextQuestion}
              style={styles.button}
              disabled={!isAnswered}
            >
              <Image
                source={require("../assets/images/next-btn.png")}
                style={[
                  styles.buttonImage,
                  !isAnswered && styles.nextButtonDisabled,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: "column",
    position: "absolute",
    left: 340,
    alignItems: "center",
    width: 60,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  millionerImage: {
    height: 489 * 0.7,
    width: 462 * 0.7,
    left: 20,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    left: -285,
  },
  questionText: {
    width: 243,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 7,
    textAlign: "center",
  },
  optionsContainer: {
    width: 243,
  },
  optionButton: {
    backgroundColor: "#f1c40f",
    padding: 7,
    marginVertical: 5,
    borderRadius: 5,
  },
  optionButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    width: "100%",
  },
  optionText: {
    color: "#000",
    fontSize: 16,
    flex: 1,
  },
  correctOption: {
    backgroundColor: "#2ecc71",
  },
  incorrectOption: {
    backgroundColor: "#e74c3c",
  },
  indicatorWrapper: {
    position: "relative",
    marginVertical: 4,
    alignItems: "center",
  },
  scoreText: {
    position: "absolute",
    top: 0,
    left: 60,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  button: {
    right: 85,
    bottom: 0,
    width: 300,
    alignItems: "center",
  },
  buttonImage: {
    width: 250,
    height: 70,
    resizeMode: "contain",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  goButton: {
    width: 173 * 0.4,
    height: 132 * 0.4,
  },
  callHintText: {
    color: "white",
    fontSize: 12,
    marginLeft: 10,
    flexShrink: 1,
  },
  hallDistributionText: {
    color: "blue",
    fontSize: 16,
    marginLeft: 10,
    flexShrink: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
  },
});
