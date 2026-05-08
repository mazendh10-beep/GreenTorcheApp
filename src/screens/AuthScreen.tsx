import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import AnimatedEntrance from "../components/AnimatedEntrance";
import MetricCard from "../components/MetricCard";
import { clearAuthError, loginUser, registerUser } from "../features/auth/authSlice";
import { roleHomeRoute } from "../navigation";
import type { AppScreenProps } from "../navigation";
import { colors, sharedStyles, spacing, typography } from "../theme";

const AuthScreen = ({ navigation }: AppScreenProps<"Auth">) => {
  const dispatch = useAppDispatch();
  const { currentUser, loading, error } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.games);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"player" | "developer">("player");

  useEffect(() => {
    if (currentUser) {
      navigation.replace(roleHomeRoute(currentUser.role));
    }
  }, [currentUser, navigation]);

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create your GreenTorch account"), [mode]);

  const onSubmit = async () => {
    if (mode === "login") {
      await dispatch(loginUser({ email, password }));
      return;
    }
    await dispatch(registerUser({ name, email, password, role }));
  };

  const switchMode = (nextMode: "login" | "register") => {
    dispatch(clearAuthError());
    setMode(nextMode);
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <AnimatedEntrance style={styles.hero}>
        <Text style={styles.eyebrow}>START YOUR CREATOR JOURNEY</Text>
        <Text style={typography.heroTitle}>{title}</Text>
        <Text style={typography.subtitle}>
          {mode === "login"
            ? "Log back in and pick up where your catalog, reviews, and dashboards left off."
            : "Create a polished player or developer profile in seconds and step into the platform."}
        </Text>
        <View style={styles.metrics}>
          <MetricCard label="Store items" value={items.length} tone="accent" />
          <MetricCard label="Mode" value={mode === "login" ? "Secure login" : "Quick signup"} />
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={90} style={sharedStyles.card}>
        <Text style={typography.screenTitle}>{title}</Text>
        <Text style={typography.subtitle}>Choose a path and move straight into the right experience.</Text>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => switchMode("login")}
            style={mode === "login" ? sharedStyles.buttonPrimary : sharedStyles.buttonSecondary}
          >
            <Text style={mode === "login" ? sharedStyles.buttonTextPrimary : sharedStyles.buttonTextSecondary}>
              Login
            </Text>
          </Pressable>
          <Pressable
            onPress={() => switchMode("register")}
            style={mode === "register" ? sharedStyles.buttonPrimary : sharedStyles.buttonSecondary}
          >
            <Text style={mode === "register" ? sharedStyles.buttonTextPrimary : sharedStyles.buttonTextSecondary}>
              Register
            </Text>
          </Pressable>
        </View>

        {mode === "register" ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={colors.muted}
            style={sharedStyles.input}
          />
        ) : null}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={sharedStyles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={sharedStyles.input}
        />

        {mode === "register" ? (
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={role}
              onValueChange={(value) => setRole(value as "player" | "developer")}
              dropdownIconColor={colors.text}
              style={styles.picker}
            >
              <Picker.Item label="Player" value="player" />
              <Picker.Item label="Developer" value="developer" />
            </Picker>
          </View>
        ) : null}

        <Pressable onPress={onSubmit} style={sharedStyles.buttonPrimary} disabled={loading}>
          <Text style={sharedStyles.buttonTextPrimary}>
            {loading ? "Processing..." : mode === "login" ? "Login" : "Create account"}
          </Text>
        </Pressable>

        {error ? (
          <View style={sharedStyles.errorBox}>
            <Text style={sharedStyles.errorText}>{error}</Text>
          </View>
        ) : null}
      </AnimatedEntrance>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.xl
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tabs: {
    flexDirection: "row",
    gap: spacing.md
  },
  pickerWrap: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden"
  },
  picker: {
    color: colors.text
  }
});

export default AuthScreen;
