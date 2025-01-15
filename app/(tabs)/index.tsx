import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import PrivacyPolicyScreen from "../privacy-policy";
import * as ScreenOrientation from "expo-screen-orientation";
import useBannerStore from "@/store/useBannerStore";

const PRIVACY_KEY = "hasAcceptedPrivacyPolicy";

const WelcomeScreen: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = React.useState<boolean>(false);
  const router = useRouter();

  const { imageUri, actionUrl, loading, error, fetchBanner, retryFetch } =
    useBannerStore();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    checkPrivacyPolicy();
  }, []);

  const checkPrivacyPolicy = async () => {
    try {
      const hasAccepted = await AsyncStorage.getItem(PRIVACY_KEY);
      if (hasAccepted !== "true") {
        setShowPrivacy(true);
      } else {
        fetchBanner();
      }
    } catch (err) {
      console.error("Помилка при перевірці політики конфіденційності:", err);
      fetchBanner();
    }
  };

  const acceptPrivacyPolicy = async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_KEY, "true");
      setShowPrivacy(false);
      fetchBanner();
    } catch (err) {
      console.error("Помилка при збереженні політики конфіденційності:", err);
    }
  };

  const handlePress = () => {
    if (actionUrl) {
      router.push("/game-selection");
      // Якщо потрібно відкривати зовнішній URL:
      // Linking.openURL(actionUrl).catch((err) => {
      //   console.error("Не вдалося відкрити URL:", err);
      // });
    } else {
      router.push("/game-selection");
    }
  };

  if (showPrivacy) {
    return <PrivacyPolicyScreen onAccept={acceptPrivacyPolicy} />;
  }

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#ffffff" />}
      {error && (
        <TouchableOpacity
          onPress={() => router.push("/game-selection")}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
      {!loading && !error && imageUri && (
        <TouchableOpacity onPress={handlePress} style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#ff0000",
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default WelcomeScreen;
