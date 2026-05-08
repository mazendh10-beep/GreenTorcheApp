import Constants from "expo-constants";

const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;

const resolveExpoHostApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri ?? null;
  if (!hostUri) return null;

  const host = hostUri.split(":")[0];
  if (!host) return null;

  return `http://${host}:5000/api`;
};

export const API_URL =
  (typeof expoApiUrl === "string" ? expoApiUrl.trim() : "") ||
  resolveExpoHostApiUrl() ||
  "http://localhost:5000/api";
