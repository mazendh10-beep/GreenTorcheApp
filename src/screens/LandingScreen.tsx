import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import AnimatedEntrance from "../components/AnimatedEntrance";
import GameCard from "../components/GameCard";
import LoadingSpinner from "../components/LoadingSpinner";
import MetricCard from "../components/MetricCard";
import SectionHeader from "../components/SectionHeader";
import { fetchPopularGames } from "../features/games/gamesSlice";
import type { AppNavigationProp } from "../navigation";
import { colors, radius, sharedStyles, spacing, typography } from "../theme";

const LandingScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const dispatch = useAppDispatch();
  const { popular, loading, error } = useAppSelector((state) => state.games);
  const { currentUser } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPopularGames());
  }, [dispatch]);

  const totalDownloads = popular.reduce((sum, game) => sum + game.downloadsCount, 0);
  const avgRating = popular.length
    ? (popular.reduce((sum, game) => sum + game.averageRating, 0) / popular.length).toFixed(1)
    : "0.0";

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <AnimatedEntrance style={styles.heroWrap}>
        <View style={sharedStyles.backgroundOrbs} pointerEvents="none">
          <View style={sharedStyles.orbTop} />
          <View style={sharedStyles.orbBottom} />
        </View>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>GREEN GLOW INDIE PLATFORM</Text>
          <Text style={typography.heroTitle}>Discover standout indie games built by rising creators.</Text>
          <Text style={typography.subtitle}>
            Browse curated releases, track community ratings, and jump from discovery to download in one flow.
          </Text>
          <View style={styles.heroActions}>
            <Pressable onPress={() => navigation.navigate("Store")} style={sharedStyles.buttonPrimary}>
              <Text style={sharedStyles.buttonTextPrimary}>Explore Store</Text>
            </Pressable>
            {!currentUser ? (
              <Pressable onPress={() => navigation.navigate("Auth")} style={sharedStyles.buttonSecondary}>
                <Text style={sharedStyles.buttonTextSecondary}>Join GreenTorch</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.metrics}>
            <MetricCard label="Featured games" value={popular.length} tone="accent" />
            <MetricCard label="Total downloads" value={totalDownloads} />
            <MetricCard label="Avg rating" value={avgRating} />
          </View>
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={120}>
        <SectionHeader
          title="Popular Right Now"
          subtitle="Top games by traction and player sentiment across the platform."
        />
      </AnimatedEntrance>

      {loading ? <LoadingSpinner /> : null}
      {error ? (
        <View style={sharedStyles.errorBox}>
          <Text style={sharedStyles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {popular.map((game, index) => (
          <AnimatedEntrance key={game.id} delay={180 + index * 80}>
            <GameCard
              game={game}
              onPress={(selectedGame) => navigation.navigate("GameDetail", { gameId: selectedGame.id })}
            />
          </AnimatedEntrance>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  heroWrap: {
    overflow: "hidden",
    borderRadius: radius.lg
  },
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    overflow: "hidden"
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2
  },
  heroActions: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  list: {
    gap: spacing.md
  }
});

export default LandingScreen;
