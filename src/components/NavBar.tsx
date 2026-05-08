import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { logout } from "../features/auth/authSlice";
import type { AppNavigationProp, HeaderRouteName } from "../navigation";
import { roleHomeRoute } from "../navigation";
import { colors, spacing } from "../theme";

const NavBar = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { width } = useWindowDimensions();
  const compact = width < 390;

  const accountLabel = currentUser ? "Account" : "Login";
  const accountRoute: HeaderRouteName = currentUser ? roleHomeRoute(currentUser.role) : "Auth";

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.brand}>GreenTorch</Text>
        {!compact ? <Text style={styles.tagline}>indie game showcase</Text> : null}
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => navigation.navigate("Store")} style={styles.link}>
          <Text style={styles.linkText}>{compact ? "Shop" : "Store"}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate(accountRoute)} style={styles.link}>
          <Text style={styles.linkText}>{accountLabel}</Text>
        </Pressable>
        {currentUser ? (
          <Pressable
            onPress={() => {
              dispatch(logout());
              navigation.navigate("Landing");
            }}
            style={styles.link}
          >
            <Text style={styles.linkText}>Logout</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  brand: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  tagline: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  link: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  linkText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600"
  }
});

export default NavBar;
