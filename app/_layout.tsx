import React, { useEffect } from "react";
import { Button, ActivityIndicator, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Stack, Slot, router } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "Futura URW Extra Bold": require("../assets/fonts/Futura URW Bold Italic.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat Extra-Bold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerTitle: "Slot",
          headerRight: () => (
            <Button
              title="Settings"
              onPress={() => router.push("/setting-screen")}
            />
          ),
        }}
      >
        <Slot />
      </Stack>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
