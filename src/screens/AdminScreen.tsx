import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import AnimatedEntrance from "../components/AnimatedEntrance";
import LoadingSpinner from "../components/LoadingSpinner";
import MetricCard from "../components/MetricCard";
import SectionHeader from "../components/SectionHeader";
import { fetchAdminOverview } from "../features/analytics/analyticsSlice";
import { deleteGame, fetchGames } from "../features/games/gamesSlice";
import { userApi } from "../services/api";
import type { User, UserRole } from "../types";
import { colors, sharedStyles, spacing, typography } from "../theme";

const AdminScreen = () => {
  const dispatch = useAppDispatch();
  const { overview, loading, error: analyticsError } = useAppSelector((state) => state.analytics);
  const { items: games, loading: gamesLoading, error: gamesError } = useAppSelector((state) => state.games);
  const { currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminOverview());
    dispatch(fetchGames({ page: 1, limit: 8 }));
    setUsersLoading(true);
    userApi
      .getAllUsers()
      .then((payload) => setUsers(payload))
      .catch((userError: Error) => setError(userError.message))
      .finally(() => setUsersLoading(false));
  }, [dispatch]);

  const changeRole = async (userId: number, role: UserRole) => {
    try {
      const updated = await userApi.updateRole(userId, role);
      setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)));
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : "Role update failed");
    }
  };

  const removeGame = async (gameId: number) => {
    try {
      await dispatch(deleteGame(gameId)).unwrap();
      await dispatch(fetchGames({ page: 1, limit: 8 })).unwrap();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Game removal failed");
    }
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <AnimatedEntrance style={styles.header}>
        <SectionHeader
          title="Admin Dashboard"
          subtitle="Platform analytics and moderation controls for users, catalog quality, and community health."
        />
        <Text style={typography.caption}>Signed in as {currentUser?.name ?? "Admin"}</Text>
      </AnimatedEntrance>

      {loading || usersLoading ? <LoadingSpinner /> : null}
      {error || analyticsError || gamesError ? (
        <View style={sharedStyles.errorBox}>
          <Text style={sharedStyles.errorText}>{error ?? analyticsError ?? gamesError}</Text>
        </View>
      ) : null}

      <AnimatedEntrance delay={60} style={styles.statsGrid}>
        <MetricCard label="Total Users" value={overview?.totalUsers ?? 0} tone="accent" />
        <MetricCard label="Total Games" value={overview?.totalGames ?? 0} />
        <MetricCard label="Total Reviews" value={overview?.totalReviews ?? 0} />
        <MetricCard label="Downloads" value={overview?.totalDownloads ?? 0} />
        <MetricCard label="Views" value={overview?.totalViews ?? 0} />
      </AnimatedEntrance>

      <AnimatedEntrance delay={100} style={sharedStyles.card}>
        <SectionHeader title="User Management" subtitle="Adjust platform roles directly from the app." />
        {users.map((user) => (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={typography.caption}>{user.email}</Text>
            </View>
            <View style={styles.userPickerWrap}>
              <Picker
                selectedValue={user.role}
                onValueChange={(value) => changeRole(user.id, value as UserRole)}
                dropdownIconColor={colors.text}
                style={styles.userPicker}
              >
                <Picker.Item label="Player" value="player" />
                <Picker.Item label="Developer" value="developer" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
          </View>
        ))}
      </AnimatedEntrance>

      <View style={styles.section}>
        <AnimatedEntrance delay={140}>
          <SectionHeader title="Game Moderation Snapshot" subtitle="A quick scan of active games and their traction." />
        </AnimatedEntrance>
        {gamesLoading ? <LoadingSpinner /> : null}
        {games.map((game, index) => (
          <AnimatedEntrance key={game.id} delay={180 + index * 40}>
            <View style={sharedStyles.softCard}>
              <Text style={styles.userName}>{game.title}</Text>
              <Text style={typography.subtitle}>{game.status} • by {game.developerName}</Text>
              <Text style={typography.caption}>
                Views {game.viewsCount} • Downloads {game.downloadsCount} • Rating {game.averageRating.toFixed(1)}
              </Text>
              <Pressable onPress={() => removeGame(game.id)} style={sharedStyles.buttonDanger}>
                <Text style={sharedStyles.buttonTextDanger}>Remove Game</Text>
              </Pressable>
            </View>
          </AnimatedEntrance>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  userRow: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  userInfo: {
    gap: 2
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  userPickerWrap: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  userPicker: {
    color: colors.text
  },
  section: {
    gap: spacing.md
  }
});

export default AdminScreen;
