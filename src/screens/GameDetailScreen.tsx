import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import AnimatedEntrance from "../components/AnimatedEntrance";
import LoadingSpinner from "../components/LoadingSpinner";
import MetricCard from "../components/MetricCard";
import RatingStars from "../components/RatingStars";
import SectionHeader from "../components/SectionHeader";
import { downloadGame, fetchGameById } from "../features/games/gamesSlice";
import { addReview, fetchGameReviews } from "../features/reviews/reviewsSlice";
import { analyticsApi } from "../services/api";
import type { AppScreenProps } from "../navigation";
import { colors, radius, sharedStyles, spacing, typography } from "../theme";

const toMoney = (value: number) =>
  new Intl.NumberFormat("en-TN", {
    style: "currency",
    currency: "TND"
  }).format(value);

const GameDetailScreen = ({ route, navigation }: AppScreenProps<"GameDetail">) => {
  const { gameId } = route.params;
  const dispatch = useAppDispatch();
  const { currentGame, loading, error } = useAppSelector((state) => state.games);
  const {
    items: reviews,
    loading: reviewsLoading,
    submitting: reviewSubmitting,
    error: reviewsError
  } = useAppSelector((state) => state.reviews);
  const { currentUser } = useAppSelector((state) => state.auth);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchGameById(gameId));
    dispatch(fetchGameReviews(gameId));
    void analyticsApi.trackView(gameId);
  }, [dispatch, gameId]);

  const canReview = useMemo(
    () => Boolean(currentUser && currentUser.role !== "admin" && currentUser.id !== currentGame?.developerId),
    [currentGame?.developerId, currentUser]
  );

  const submitReview = async () => {
    if (!comment.trim()) {
      setReviewMessage("Please write a valid comment before submitting.");
      return;
    }

    setReviewMessage(null);
    try {
      await dispatch(addReview({ gameId, payload: { rating, comment: comment.trim() } })).unwrap();
      await dispatch(fetchGameReviews(gameId)).unwrap();
      await dispatch(fetchGameById(gameId)).unwrap();
      setComment("");
      setReviewMessage("Review saved.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Could not submit review.";
      setReviewMessage(message);
    }
  };

  const startDownload = async () => {
    try {
      const response = await dispatch(downloadGame(gameId)).unwrap();
      setDownloadLink(response.downloadUrl);
      await Linking.openURL(response.downloadUrl);
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : "Could not open download.";
      setReviewMessage(message);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <View style={[sharedStyles.screen, sharedStyles.content]}>
        <View style={sharedStyles.errorBox}>
          <Text style={sharedStyles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!currentGame) {
    return (
      <View style={[sharedStyles.screen, sharedStyles.content]}>
        <Text style={typography.body}>Game not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      {currentGame.bannerImageUrl ? (
        <AnimatedEntrance>
          <Image source={{ uri: currentGame.bannerImageUrl }} style={styles.banner} />
        </AnimatedEntrance>
      ) : null}

      <AnimatedEntrance delay={70} style={sharedStyles.card}>
        <Text style={styles.status}>{currentGame.status === "published" ? "Published" : "Draft"}</Text>
        <Text style={typography.screenTitle}>{currentGame.title}</Text>
        <Text style={typography.subtitle}>By {currentGame.developerName}</Text>
        <Text style={styles.price}>{toMoney(currentGame.priceTnd)}</Text>
        <View style={styles.ratingRow}>
          <RatingStars rating={currentGame.averageRating ?? 0} />
          <Text style={typography.caption}>{currentGame.reviewCount} reviews</Text>
        </View>
        <View style={styles.metricsRow}>
          <MetricCard label="Views" value={currentGame.viewsCount} />
          <MetricCard label="Downloads" value={currentGame.downloadsCount} />
          <MetricCard label="Category" value={currentGame.category} tone="accent" />
        </View>

        <View style={styles.buttonRow}>
          <Pressable onPress={startDownload} style={sharedStyles.buttonPrimary}>
            <Text style={sharedStyles.buttonTextPrimary}>Download</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Store")} style={sharedStyles.buttonSecondary}>
            <Text style={sharedStyles.buttonTextSecondary}>Back to store</Text>
          </Pressable>
        </View>

        {downloadLink ? <Text style={typography.caption}>Download started: {downloadLink}</Text> : null}

        <Text style={typography.body}>{currentGame.description}</Text>
        <View style={styles.tagsRow}>
          {currentGame.tags.map((tag) => (
            <View key={tag} style={sharedStyles.pill}>
              <Text style={sharedStyles.pillText}>{tag}</Text>
            </View>
          ))}
        </View>
      </AnimatedEntrance>

      {canReview ? (
        <AnimatedEntrance delay={120} style={sharedStyles.card}>
          <SectionHeader
            title="Leave a review"
            subtitle="A short review makes the game page feel more alive and helps your showcase stand out."
          />
          <Text style={styles.label}>Rating</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={rating}
              onValueChange={(value) => setRating(Number(value))}
              dropdownIconColor={colors.text}
              style={styles.picker}
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <Picker.Item key={star} label={`${star}`} value={star} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Comment</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Tell players what stood out"
            placeholderTextColor={colors.muted}
            multiline
            style={[sharedStyles.input, sharedStyles.textArea]}
          />
          <Pressable onPress={submitReview} style={sharedStyles.buttonPrimary} disabled={reviewSubmitting}>
            <Text style={sharedStyles.buttonTextPrimary}>{reviewSubmitting ? "Submitting..." : "Submit review"}</Text>
          </Pressable>
          {reviewMessage ? <Text style={typography.caption}>{reviewMessage}</Text> : null}
          {reviewsError ? <Text style={sharedStyles.errorText}>{reviewsError}</Text> : null}
        </AnimatedEntrance>
      ) : null}

      <View style={styles.reviewSection}>
        <AnimatedEntrance delay={160}>
          <SectionHeader title="Reviews" subtitle="Player reactions, quick impressions, and community sentiment." />
        </AnimatedEntrance>
        {reviewsLoading ? <LoadingSpinner /> : null}
        {reviews.map((review, index) => (
          <AnimatedEntrance key={review.id} delay={200 + index * 50}>
            <View style={sharedStyles.softCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.userName}</Text>
                <RatingStars rating={review.rating} />
              </View>
              <Text style={typography.subtitle}>{review.comment}</Text>
            </View>
          </AnimatedEntrance>
        ))}
        {!reviews.length && !reviewsLoading ? <Text style={typography.subtitle}>No reviews yet.</Text> : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.surface
  },
  status: {
    color: colors.muted,
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5
  },
  price: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "800"
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  pickerWrap: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden"
  },
  picker: {
    color: colors.text
  },
  reviewSection: {
    gap: spacing.md
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  reviewAuthor: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  }
});

export default GameDetailScreen;
