import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import HeaderBar from "@/components/Header";
import useComplexHighScoreStore from "@/store/useComplexHighScore";
import useBalanceStore from "@/store/useBalance";

const difficulties: Array<"Easy" | "Medium" | "Hard"> = [
  "Easy",
  "Medium",
  "Hard",
];

const BackgroundContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ImageBackground
      source={require("../assets/images/welcome-bg.png")}
      style={styles.background}
    >
      <LinearGradient
        colors={["rgba(11, 91, 145, 0.95)", "rgba(11, 91, 145, 0.95)"]}
        style={styles.gradient}
      />
      <HeaderBar />
      {children}
    </ImageBackground>
  );
};

const AcceptButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Image
        source={require("../assets/images/accept.png")}
        style={styles.buttonImage}
      />
    </TouchableOpacity>
  );
};

const NoGameIdScreen: React.FC<{ onPressAccept: () => void }> = ({
  onPressAccept,
}) => {
  const { t } = useTranslation();
  return (
    <BackgroundContainer>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t("highScore")}</Text>
      </View>
      <AcceptButton onPress={onPressAccept} />
    </BackgroundContainer>
  );
};

const SimpleHighScoreScreen: React.FC<{
  scores: number[];
  onPressAccept: () => void;
}> = ({ scores, onPressAccept }) => {
  const { t } = useTranslation();

  const sortedScores = useMemo(
    () => scores.filter(Boolean).sort((a, b) => b - a),
    [scores]
  );
  const half = Math.floor(sortedScores.length / 2);
  const leftColumn = sortedScores.slice(0, half);
  const rightColumn = sortedScores.slice(half);

  return (
    <BackgroundContainer>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t("highScore")}</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {sortedScores.length === 0 ? (
            <Text style={styles.noScores}>No results yet</Text>
          ) : (
            <>
              {sortedScores.length >= 3 && (
                <Text style={styles.topThreeLabel}>TOP 3</Text>
              )}
              <View style={styles.scoresContainer}>
                <View>
                  {leftColumn.map((score, index) => {
                    const isTop3 = index < 3;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.scoreRow,
                          isTop3 ? styles.borderTop3 : {},
                          {
                            paddingTop: index === 0 ? 10 : 0,
                            paddingBottom: index === 2 ? 10 : 0,
                            borderTopWidth:
                              index === 1 || index === 2 ? 0 : undefined,
                            borderBottomWidth:
                              index === 0 || index === 1 ? 0 : undefined,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.indexText,
                            !isTop3 && { color: "#83BBDE" },
                          ]}
                        >
                          {index + 1}:
                        </Text>
                        <Text
                          style={[
                            styles.scoreText,
                            !isTop3 && { color: "#83BBDE" },
                          ]}
                        >
                          {score}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View>
                  {rightColumn.map((score, index) => {
                    const globalIndex = index + half;
                    return (
                      <View key={index} style={styles.scoreRow}>
                        <Text style={[styles.indexText, { color: "#83BBDE" }]}>
                          {globalIndex + 1}:
                        </Text>
                        <Text style={[styles.scoreText, { color: "#83BBDE" }]}>
                          {score}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
      <AcceptButton onPress={onPressAccept} />
    </BackgroundContainer>
  );
};

const ComplexHighScoreScreen: React.FC<{
  gameId: string;
  onPressAccept: () => void;
}> = ({ gameId, onPressAccept }) => {
  const { t } = useTranslation();
  const { complexHighScores, totalWins, totalAttempts } =
    useComplexHighScoreStore();
  const entries = complexHighScores[gameId] || [];

  const stats = useMemo(() => {
    return difficulties.map((diff) => {
      const diffEntries = entries.filter((e) => e.difficulty === diff);
      const attempts = diffEntries.length;
      const wins = diffEntries.filter((e) => e.isWin).length;
      const totalScore = diffEntries.reduce((acc, e) => acc + e.score, 0);
      const averageScore = attempts > 0 ? totalScore / attempts : 0;
      const winPercent = attempts > 0 ? (wins / attempts) * 100 : 0;
      return {
        difficulty: diff,
        attempts,
        wins,
        averageScore,
        winPercent,
      };
    });
  }, [entries]);

  const isEmpty = entries.length === 0;
  const globalWinPercent =
    totalAttempts > 0 ? ((totalWins / totalAttempts) * 100).toFixed(1) : "0";

  return (
    <BackgroundContainer>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t("highScore")}</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isEmpty ? (
            <Text style={styles.noScores}>No results yet</Text>
          ) : (
            <>
              <Text
                style={{
                  justifyContent: "space-between",
                  color: "#fff",
                  fontSize: 22,
                  fontFamily: "Montserrat-Bold",
                }}
              >
                {t("percent of wins")}: {globalWinPercent}%
              </Text>
              <View>
                {stats.map((item) => (
                  <View key={item.difficulty} style={styles.statRow}>
                    <Text style={styles.statDiff}>{t(item.difficulty)}</Text>
                    <View
                      style={[
                        styles.statValuesContainer,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <Text style={styles.stats3}>{t("attempts")}</Text>
                      <Text style={styles.stats3}>{item.attempts}</Text>
                    </View>
                    <View
                      style={[
                        styles.statValuesContainer,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <Text style={styles.stats3}>
                        {t("wins")}: {item.wins}
                      </Text>
                      <Text style={styles.stats3}>
                        ({item.winPercent.toFixed(1)}%)
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statValuesContainer,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },
                      ]}
                    >
                      <Text style={styles.stats3}>{t("avgScore")}</Text>
                      <Text style={styles.stats3}>
                        {item.averageScore.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
      <AcceptButton onPress={onPressAccept} />
    </BackgroundContainer>
  );
};

const HighScoreScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { gameId } = useLocalSearchParams();
  const { highScores } = useBalanceStore();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }, [gameId]);

  const handleAcceptPress = () => {
    router.back();
  };

  if (!gameId) {
    return <NoGameIdScreen onPressAccept={handleAcceptPress} />;
  }

  if (gameId === "game1" || gameId === "game3") {
    const storeScores = highScores[gameId] || [];
    return (
      <SimpleHighScoreScreen
        scores={storeScores}
        onPressAccept={handleAcceptPress}
      />
    );
  }

  return (
    <ComplexHighScoreScreen
      gameId={gameId as string}
      onPressAccept={handleAcceptPress}
    />
  );
};

export default HighScoreScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    resizeMode: "cover",
    justifyContent: "center",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },

  title: {
    fontSize: 32,
    color: "#fff",
    marginVertical: 20,
    textAlign: "center",
    fontFamily: "Montserrat Extra-Bold",
  },
  noScores: {
    fontSize: 20,
    color: "#ccc",
    marginVertical: 20,
    textAlign: "center",
  },

  button: {
    width: "100%",
    alignItems: "center",
  },
  buttonImage: {
    width: 300,
    resizeMode: "contain",
  },

  topThreeLabel: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    left: "15%",
    marginBottom: 10,
  },
  scoresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  scoreRow: {
    flexDirection: "row",
    borderColor: "#fff",
  },
  borderTop3: {
    borderWidth: 2,
  },
  indexText: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Montserrat-Regular",
    marginHorizontal: 15,
  },
  scoreText: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Montserrat-Bold",
  },

  levelsLabel: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    marginBottom: 5,
  },
  statRow: {
    padding: 8,
    marginBottom: 10,
    borderRadius: 8,
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statValuesContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
  statDiff: {
    color: "#fff",
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    marginBottom: 5,
  },
  stats3: {
    color: "#fff",
    fontFamily: "Montserrat-Regular",
  },
  sectionTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
});
