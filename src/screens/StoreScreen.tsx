import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import AnimatedEntrance from "../components/AnimatedEntrance";
import GameCard from "../components/GameCard";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionHeader from "../components/SectionHeader";
import { fetchGames } from "../features/games/gamesSlice";
import type { AppNavigationProp } from "../navigation";
import { colors, sharedStyles, spacing, typography } from "../theme";

const StoreScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const dispatch = useAppDispatch();
  const { items, loading, error, meta } = useAppSelector((state) => state.games);
  const { currentUser } = useAppSelector((state) => state.auth);
  const { width } = useWindowDimensions();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const columns = width >= 960 ? 3 : width >= 640 ? 2 : 1;

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 260);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchGames({ page: 1, limit: 12, search, category }));
  }, [category, dispatch, search]);

  const header = useMemo(
    () => (
      <View style={styles.headerWrap}>
        <AnimatedEntrance>
          <SectionHeader
            title="Store"
            subtitle="Responsive browsing, fast filtering, and smooth access to every title in the catalog."
          />
        </AnimatedEntrance>

        <AnimatedEntrance delay={80} style={sharedStyles.card}>
          <Text style={styles.label}>Search</Text>
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Find games by title"
            placeholderTextColor={colors.muted}
            style={sharedStyles.input}
          />
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(String(value))}
              dropdownIconColor={colors.text}
              itemStyle={styles.pickerItem}
              style={styles.picker}
            >
              <Picker.Item color={colors.text} label="All categories" style={styles.pickerItem} value="" />
              <Picker.Item color={colors.text} label="Adventure" style={styles.pickerItem} value="Adventure" />
              <Picker.Item color={colors.text} label="Action" style={styles.pickerItem} value="Action" />
              <Picker.Item color={colors.text} label="Puzzle" style={styles.pickerItem} value="Puzzle" />
              <Picker.Item color={colors.text} label="Strategy" style={styles.pickerItem} value="Strategy" />
              <Picker.Item color={colors.text} label="RPG" style={styles.pickerItem} value="RPG" />
            </Picker>
          </View>
          <View style={styles.summaryRow}>
            <View style={sharedStyles.pill}>
              <Text style={sharedStyles.pillText}>{meta.total} results</Text>
            </View>
            {search ? (
              <View style={sharedStyles.pill}>
                <Text style={sharedStyles.pillText}>query: {search}</Text>
              </View>
            ) : null}
            {category ? (
              <View style={sharedStyles.pill}>
                <Text style={sharedStyles.pillText}>{category}</Text>
              </View>
            ) : null}
          </View>
          {!currentUser ? (
            <Pressable onPress={() => navigation.navigate("Auth")} style={sharedStyles.buttonSecondary}>
              <Text style={sharedStyles.buttonTextSecondary}>Login to buy or review</Text>
            </Pressable>
          ) : null}
        </AnimatedEntrance>

        {loading ? <LoadingSpinner /> : null}
        {error ? (
          <View style={sharedStyles.errorBox}>
            <Text style={sharedStyles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>
    ),
    [category, currentUser, error, loading, meta.total, navigation, search, searchInput]
  );

  return (
    <FlatList
      style={sharedStyles.screen}
      contentContainerStyle={sharedStyles.content}
      data={items}
      key={`store-${columns}`}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={header}
      renderItem={({ item, index }) => (
        <AnimatedEntrance delay={160 + index * 50} style={columns > 1 ? styles.gridItem : undefined}>
          <GameCard
            game={item}
            onPress={(selectedGame) => navigation.navigate("GameDetail", { gameId: selectedGame.id })}
          />
        </AnimatedEntrance>
      )}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyState}>
            <Text style={typography.subtitle}>No games found. Try a broader search or another category.</Text>
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    gap: spacing.lg
  },
  columnWrapper: {
    gap: spacing.md
  },
  gridItem: {
    flex: 1
  },
  emptyState: {
    paddingVertical: spacing.xl
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginTop: spacing.sm
  },
  pickerWrap: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden"
  },
  picker: {
    backgroundColor: colors.surfaceSoft,
    color: colors.text
  },
  pickerItem: {
    backgroundColor: colors.surfaceSoft,
    color: colors.text
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  }
});

export default StoreScreen;
