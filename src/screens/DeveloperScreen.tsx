import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import AnimatedEntrance from "../components/AnimatedEntrance";
import LoadingSpinner from "../components/LoadingSpinner";
import MetricCard from "../components/MetricCard";
import SectionHeader from "../components/SectionHeader";
import { fetchDeveloperAnalytics } from "../features/analytics/analyticsSlice";
import { createGame, deleteGame, fetchDeveloperGames, updateGame } from "../features/games/gamesSlice";
import type { Game, GameInput } from "../types";
import { colors, sharedStyles, spacing, typography } from "../theme";

const emptyForm: GameInput = {
  title: "",
  shortDescription: "",
  description: "",
  category: "Adventure",
  tags: [],
  priceTnd: 0,
  coverImageUrl: "",
  bannerImageUrl: "",
  downloadUrl: "https://example.com/download",
  status: "draft"
};

const DeveloperScreen = () => {
  const dispatch = useAppDispatch();
  const { developerGames, loading, error } = useAppSelector((state) => state.games);
  const { developerStats } = useAppSelector((state) => state.analytics);
  const { currentUser } = useAppSelector((state) => state.auth);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<GameInput>(emptyForm);
  const [tagsInput, setTagsInput] = useState("");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDeveloperGames());
    dispatch(fetchDeveloperAnalytics());
  }, [dispatch]);

  const statsByGame = useMemo(() => new Map(developerStats.map((entry) => [entry.gameId, entry])), [developerStats]);
  const totalDownloads = developerStats.reduce((sum, entry) => sum + entry.downloadsCount, 0);

  const loadForEdit = (game: Game) => {
    setEditingGame(game);
    setTagsInput(game.tags.join(", "));
    setFormData({
      title: game.title,
      shortDescription: game.shortDescription,
      description: game.description,
      category: game.category,
      tags: game.tags,
      priceTnd: game.priceTnd,
      coverImageUrl: game.coverImageUrl,
      bannerImageUrl: game.bannerImageUrl,
      downloadUrl: game.downloadUrl,
      status: game.status
    });
    setFormMessage(null);
  };

  const resetForm = () => {
    setEditingGame(null);
    setFormData(emptyForm);
    setTagsInput("");
    setFormMessage(null);
  };

  const submitGame = async () => {
    setFormMessage(null);
    const payload: GameInput = {
      ...formData,
      tags: tagsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      if (editingGame) {
        await dispatch(updateGame({ id: editingGame.id, payload })).unwrap();
        setFormMessage("Game updated successfully.");
      } else {
        await dispatch(createGame(payload)).unwrap();
        setFormMessage("Game published successfully.");
      }
      await dispatch(fetchDeveloperGames()).unwrap();
      resetForm();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Could not save game. Please review inputs.";
      setFormMessage(message);
    }
  };

  const removeGame = async (id: number) => {
    try {
      await dispatch(deleteGame(id)).unwrap();
      await dispatch(fetchDeveloperGames()).unwrap();
      setFormMessage("Game removed.");
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : "Could not delete game.";
      setFormMessage(message);
    }
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <AnimatedEntrance style={styles.header}>
        <SectionHeader
          title="Developer Dashboard"
          subtitle="Publish games, manage metadata, and monitor how your project is landing with players."
        />
        <Text style={typography.caption}>Signed in as {currentUser?.name ?? "Developer"}</Text>
        <View style={styles.metrics}>
          <MetricCard label="Your games" value={developerGames.length} tone="accent" />
          <MetricCard label="Downloads" value={totalDownloads} />
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={80} style={sharedStyles.card}>
        <SectionHeader title={editingGame ? "Edit Game" : "Publish New Game"} />
        <TextInput
          value={formData.title}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, title: value }))}
          placeholder="Game title"
          placeholderTextColor={colors.muted}
          style={sharedStyles.input}
        />
        <TextInput
          value={formData.category}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          placeholder="Category"
          placeholderTextColor={colors.muted}
          style={sharedStyles.input}
        />
        <TextInput
          value={formData.shortDescription}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, shortDescription: value }))}
          placeholder="Short description"
          placeholderTextColor={colors.muted}
          style={sharedStyles.input}
        />
        <TextInput
          value={formData.description}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, description: value }))}
          placeholder="Full description"
          placeholderTextColor={colors.muted}
          multiline
          style={[sharedStyles.input, sharedStyles.textArea]}
        />
        <TextInput
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder="Tags (comma separated)"
          placeholderTextColor={colors.muted}
          style={sharedStyles.input}
        />
        <TextInput
          value={String(formData.priceTnd)}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, priceTnd: Number(value) || 0 }))}
          placeholder="Price (TND)"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          style={sharedStyles.input}
        />
        <TextInput
          value={formData.coverImageUrl}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, coverImageUrl: value }))}
          placeholder="Cover image URL"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={sharedStyles.input}
        />
        <TextInput
          value={formData.bannerImageUrl}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, bannerImageUrl: value }))}
          placeholder="Banner image URL"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={sharedStyles.input}
        />
        <TextInput
          value={formData.downloadUrl}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, downloadUrl: value }))}
          placeholder="Download URL"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={sharedStyles.input}
        />
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value as GameInput["status"] }))
            }
            dropdownIconColor={colors.text}
            style={styles.picker}
          >
            <Picker.Item label="Draft" value="draft" />
            <Picker.Item label="Published" value="published" />
          </Picker>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={submitGame} style={sharedStyles.buttonPrimary}>
            <Text style={sharedStyles.buttonTextPrimary}>{editingGame ? "Save Changes" : "Publish Game"}</Text>
          </Pressable>
          {editingGame ? (
            <Pressable onPress={resetForm} style={sharedStyles.buttonSecondary}>
              <Text style={sharedStyles.buttonTextSecondary}>Cancel Edit</Text>
            </Pressable>
          ) : null}
        </View>

        {formMessage ? <Text style={typography.caption}>{formMessage}</Text> : null}
        {error ? <Text style={sharedStyles.errorText}>{error}</Text> : null}
      </AnimatedEntrance>

      <View style={styles.section}>
        <AnimatedEntrance delay={120}>
          <SectionHeader title="Your Games" subtitle="Edit, review traction, or remove titles from your dashboard." />
        </AnimatedEntrance>
        {loading ? <LoadingSpinner /> : null}
        {developerGames.map((game, index) => {
          const stats = statsByGame.get(game.id);
          return (
            <AnimatedEntrance key={game.id} delay={160 + index * 40}>
              <View style={sharedStyles.softCard}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={typography.subtitle}>
                  {game.status} • Views {stats?.viewsCount ?? game.viewsCount} • Downloads{" "}
                  {stats?.downloadsCount ?? game.downloadsCount}
                </Text>
                <Text style={typography.caption}>
                  Rating {(stats?.averageRating ?? game.averageRating).toFixed(1)}
                </Text>
                <View style={styles.actions}>
                  <Pressable onPress={() => loadForEdit(game)} style={sharedStyles.buttonSecondary}>
                    <Text style={sharedStyles.buttonTextSecondary}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => removeGame(game.id)} style={sharedStyles.buttonDanger}>
                    <Text style={sharedStyles.buttonTextDanger}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </AnimatedEntrance>
          );
        })}
        {!developerGames.length && !loading ? <Text style={typography.subtitle}>No games yet. Publish your first title above.</Text> : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
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
  },
  section: {
    gap: spacing.md
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  gameTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700"
  }
});

export default DeveloperScreen;
