import React from "react";
import { WebView } from "react-native-webview";

export default function WebViewScreen() {
  return (
    <WebView source={{ uri: "https://www.google.com/" }} style={{ flex: 1 }} />
  );
}
