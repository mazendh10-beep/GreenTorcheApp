import { useRef } from "react";
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { Game } from "../types";
import { colors, radius, spacing, typography } from "../theme";
import RatingStars from "./RatingStars";

interface GameCardProps {
  game: Game;
  onPress: (game: Game) => void;
}

const toMoney = (value: number) =>
  new Intl.NumberFormat("en-TN", {
    style: "currency",
    currency: "TND"
  }).format(value);

const cardShadow =
  Platform.OS === "web"
    ? ({ boxShadow: `0 10px 20px ${colors.shadow}` } as object)
    : {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 5
      };

const GameCard = ({ game, onPress }: GameCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const useNativeDriver = Platform.OS !== "web";

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      speed: 22,
      bounciness: 4,
      useNativeDriver
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale }]
        }
      ]}
    >
      <Pressable
        onPress={() => onPress(game)}
        onPressIn={() => animateScale(0.985)}
        onPressOut={() => animateScale(1)}
      >
        {game.coverImageUrl ? (
          <Image source={{ uri: game.coverImageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Cover coming soon</Text>
          </View>
        )}
        <View style={styles.imageOverlay}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.developerName}>{game.developerName}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {game.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {game.shortDescription}
          </Text>
          <View style={styles.tags}>
            {game.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <View>
              <Text style={styles.price}>{toMoney(game.priceTnd)}</Text>
              <Text style={styles.metaText}>
                {game.downloadsCount} downloads • {game.viewsCount} views
              </Text>
            </View>
            <View style={styles.ratingBlock}>
              <RatingStars rating={game.averageRating || 0} />
              <Text style={styles.metaText}>{game.reviewCount} reviews</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...cardShadow
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: colors.surfaceSoft
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statusPill: {
    backgroundColor: "rgba(15,17,21,0.84)",
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  statusText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800"
  },
  developerName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(15,17,21,0.84)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 19
  },
  description: {
    ...typography.subtitle
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surfaceSoft
  },
  tagText: {
    color: colors.muted,
    fontSize: 12
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  price: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "800"
  },
  ratingBlock: {
    alignItems: "flex-end",
    gap: 4
  },
  metaText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  }
});

export default GameCard;
