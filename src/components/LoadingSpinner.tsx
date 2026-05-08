import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme";

const LoadingSpinner = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default LoadingSpinner;
