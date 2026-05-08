import { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Provider } from "react-redux";
import { store } from "./src/state/store";
import { useAppDispatch, useAppSelector } from "./src/state/hooks";
import NavBar from "./src/components/NavBar";
import LoadingSpinner from "./src/components/LoadingSpinner";
import { loadSession } from "./src/features/auth/authSlice";
import AccountScreen from "./src/screens/AccountScreen";
import AdminScreen from "./src/screens/AdminScreen";
import AuthScreen from "./src/screens/AuthScreen";
import DeveloperScreen from "./src/screens/DeveloperScreen";
import GameDetailScreen from "./src/screens/GameDetailScreen";
import LandingScreen from "./src/screens/LandingScreen";
import StoreScreen from "./src/screens/StoreScreen";
import type { RootStackParamList } from "./src/navigation";
import { colors } from "./src/theme";

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

const ProtectedScreen = ({
  allowedRoles,
  children
}: {
  allowedRoles: Array<"player" | "developer" | "admin">;
  children: JSX.Element;
}) => {
  const { currentUser, initialized } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.games);

  if (!initialized) return <LoadingSpinner />;

  if (!currentUser) {
    return (
      <View style={styles.guard}>
        <Text style={styles.guardTitle}>Authentication required</Text>
        <Text style={styles.guardText}>Log in to access this protected area.</Text>
      </View>
    );
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <View style={styles.guard}>
        <Text style={styles.guardTitle}>Access restricted</Text>
        <Text style={styles.guardText}>Your account role does not have permission to open this screen.</Text>
        {loading ? <LoadingSpinner /> : null}
      </View>
    );
  }

  return children;
};

const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  if (!initialized) return <LoadingSpinner />;

  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.background,
          primary: colors.accent,
          text: colors.text,
          border: colors.border,
          notification: colors.accent
        }
      }}
    >
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background
          },
          headerShadowVisible: false,
          headerTitle: () => <NavBar />,
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background
          }
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="GameDetail" component={GameDetailScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Account">
          {() => (
            <ProtectedScreen allowedRoles={["player", "developer", "admin"]}>
              <AccountScreen />
            </ProtectedScreen>
          )}
        </Stack.Screen>
        <Stack.Screen name="Developer">
          {() => (
            <ProtectedScreen allowedRoles={["developer", "admin"]}>
              <DeveloperScreen />
            </ProtectedScreen>
          )}
        </Stack.Screen>
        <Stack.Screen name="Admin">
          {() => (
            <ProtectedScreen allowedRoles={["admin"]}>
              <AdminScreen />
            </ProtectedScreen>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  guard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
    gap: 12
  },
  guardTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800"
  },
  guardText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});

export default App;
