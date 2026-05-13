import Constants from "expo-constants";
import { Platform } from "react-native";

const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;

const resolveExpoHostApiUrl = () => {
  if (Platform.OS === "web") return null;

  const hostUri = Constants.expoConfig?.hostUri ?? null;
  if (!hostUri) return null;

  const host = hostUri.split(":")[0];
  if (!host) return null;

  return `http://${host}:5000/api`;
};

export const API_URL =
  (typeof expoApiUrl === "string" ? expoApiUrl.trim() : "") ||
  resolveExpoHostApiUrl() ||
  "";
