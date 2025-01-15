import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

interface OptionButtonProps {
  label: string; // Наприклад "A", "B", "C", "D"
  text: string; // Текст відповіді
  isSelected?: boolean;
  isCorrect?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  text,
  isSelected,
  isCorrect,
  onPress,
  disabled,
}) => {
  // Залежно від стану можна змінювати стилі фону
  let backgroundStyle = styles.optionContainer;

  if (isSelected && isCorrect) {
    backgroundStyle = { ...styles.optionContainer, ...styles.correctOption };
  } else if (isSelected && !isCorrect) {
    backgroundStyle = { ...styles.optionContainer, ...styles.incorrectOption };
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={backgroundStyle}
    >
      <View style={styles.contentRow}>
        {/* Ліва частина - шістикутник */}
        {/* Використовуємо ImageBackground з вашим зображенням або SVG */}
        <ImageBackground
          source={require("../assets/images/hex-shape.png")}
          style={styles.hexBackground}
          resizeMode="contain"
        >
          <Text style={styles.hexText}>{label}</Text>
        </ImageBackground>

        {/* Права частина - прямокутник із текстом */}
        <View style={styles.answerTextContainer}>
          <Text style={styles.answerText}>{text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    marginVertical: 5,
    borderRadius: 5,
    // Можна додати якийсь фон або прозорий,
    // адже основні стилі будуть у внутрішніх елементах
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hexBackground: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  hexText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  answerTextContainer: {
    flex: 1,
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 7,
    paddingHorizontal: 25,
    zIndex: -1,
    left: -30,
  },
  answerText: {
    color: "#fff",
    fontSize: 16,
  },
  correctOption: {
    // Наприклад, зеленим позначити правильну відповідь
    // Можна затінити текст чи додати інший ефект
    borderColor: "#2ecc71",
  },
  incorrectOption: {
    // Наприклад, червоним позначити невірну відповідь
    borderColor: "#e74c3c",
  },
});

export default OptionButton;
