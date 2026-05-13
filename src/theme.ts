import { Platform, StyleSheet } from "react-native";

export const colors = {
  background: "#0f1115",
  backgroundAlt: "#131821",
  primary: "#18a558",
  accent: "#2bff88",
  accentSoft: "rgba(43,255,136,0.14)",
  text: "#f5f5f5",
  muted: "#a8b0b9",
  surface: "#171a21",
  surfaceSoft: "#1d222b",
  border: "rgba(255,255,255,0.10)",
  danger: "#ff7d7d",
  warning: "#ffd166",
  shadow: "rgba(0,0,0,0.28)"
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16
} as const;

const webShadow = (y: number, blur: number, color: string) =>
  Platform.OS === "web" ? ({ boxShadow: `0 ${y}px ${blur}px ${color}` } as object) : null;

const nativeShadow = (color: string, y: number, opacity: number, radiusValue: number, elevation: number) =>
  Platform.OS === "web"
    ? null
    : {
        shadowColor: color,
        shadowOffset: { width: 0, height: y },
        shadowOpacity: opacity,
        shadowRadius: radiusValue,
        elevation
      };

export const typography = StyleSheet.create({
  heroTitle: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -0.9
  },
  screenTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  caption: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  backgroundOrbs: {
    ...StyleSheet.absoluteFillObject
  },
  orbTop: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(43,255,136,0.08)"
  },
  orbBottom: {
    position: "absolute",
    bottom: -70,
    left: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(24,165,88,0.10)"
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...webShadow(10, 24, colors.shadow),
    ...nativeShadow(colors.shadow, 10, 0.2, 24, 4)
  },
  softCard: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    ...webShadow(8, 18, "rgba(24,165,88,0.25)"),
    ...nativeShadow(colors.primary, 8, 0.25, 18, 4)
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonDanger: {
    backgroundColor: "rgba(255,125,125,0.12)",
    borderColor: "rgba(255,125,125,0.35)",
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonTextPrimary: {
    color: "#08120d",
    fontSize: 15,
    fontWeight: "700"
  },
  buttonTextSecondary: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  buttonTextDanger: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700"
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft
  },
  pillText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600"
  },
  input: {
    minHeight: 48,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  errorBox: {
    backgroundColor: "rgba(255,125,125,0.08)",
    borderColor: "rgba(255,125,125,0.30)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md
  },
  errorText: {
    color: colors.danger,
    fontSize: 14
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  }
});
