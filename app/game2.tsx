import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  View,
  TouchableOpacity,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";

const quizData = require("../assets/quiz.json");

export default function Game1Screen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = quizData.quiz[0].questions[currentQuestionIndex];

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.quiz[0].questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      alert("You've completed the quiz!");
    }
  };

  const QuestionNumberIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {Array.from({ length: 10 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorItem,
              currentQuestionIndex === index && styles.currentIndicatorItem,
            ]}
          >
            <Text
              style={[
                styles.indicatorText,
                currentQuestionIndex === index && styles.currentIndicatorText,
              ]}
            >
              {index + 1}
            </Text>
          </View>
        ))}
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
        <View style={styles.rowContainer}>
          <Image
            source={require("../assets/images/milioner.png")}
            style={styles.millionerImage}
          />

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option: string, index: number) => (
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
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>NEXT</Text>
          </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#f1c40f",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  optionText: {
    color: "#000",
    fontSize: 16,
  },
  correctOption: {
    backgroundColor: "#2ecc71",
  },
  incorrectOption: {
    backgroundColor: "#e74c3c",
  },
  nextButton: {
    flexShrink: 0,
    marginLeft: 20,
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  indicatorContainer: {
    flexDirection: "column",
    position: "absolute",
    left: 10,
    top: 50,
    alignItems: "center",
  },
  indicatorItem: {
    backgroundColor: "#ccc",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  currentIndicatorItem: {
    backgroundColor: "#3498db",
  },
  indicatorText: {
    color: "#000",
    fontWeight: "bold",
  },
  currentIndicatorText: {
    color: "#fff",
  },
});
