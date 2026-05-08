import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "accent";
}

const MetricCard = ({ label, value, tone = "default" }: MetricCardProps) => {
  return (
    <View style={[styles.card, tone === "accent" ? styles.cardAccent : undefined]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, tone === "accent" ? styles.valueAccent : undefined]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minWidth: 120,
    flexGrow: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md
  },
  cardAccent: {
    backgroundColor: colors.accentSoft,
    borderColor: "rgba(43,255,136,0.30)"
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  valueAccent: {
    color: colors.accent
  }
});

export default MetricCard;
