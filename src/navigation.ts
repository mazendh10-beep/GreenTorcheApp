import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import type { UserRole } from "./types";

export type RootStackParamList = {
  Landing: undefined;
  Store: undefined;
  GameDetail: { gameId: number };
  Auth: undefined;
  Account: undefined;
  Developer: undefined;
  Admin: undefined;
};

export type HeaderRouteName = "Landing" | "Store" | "Auth" | "Account" | "Developer" | "Admin";

export type AppScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const roleHomeRoute = (role?: UserRole | null): HeaderRouteName => {
  if (role === "admin") return "Admin";
  if (role === "developer") return "Developer";
  if (role === "player") return "Account";
  return "Landing";
};
