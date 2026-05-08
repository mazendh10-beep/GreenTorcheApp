import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import AnimatedEntrance from "../components/AnimatedEntrance";
import LoadingSpinner from "../components/LoadingSpinner";
import MetricCard from "../components/MetricCard";
import SectionHeader from "../components/SectionHeader";
import { updateProfile } from "../features/auth/authSlice";
import { reviewApi } from "../services/api";
import type { UserReview } from "../types";
import { colors, sharedStyles, spacing, typography } from "../theme";

const AccountScreen = () => {
  const dispatch = useAppDispatch();
  const { currentUser, loading, error } = useAppSelector((state) => state.auth);
  const [myReviews, setMyReviews] = useState<UserReview[]>([]);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    setName(currentUser?.name ?? "");
    setBio(currentUser?.bio ?? "");
    setAvatarUrl(currentUser?.avatarUrl ?? "");
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;
    setReviewsLoading(true);
    reviewApi
      .mine()
      .then((payload) => setMyReviews(payload))
      .catch(() => setMyReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [currentUser?.id]);

  const saveProfile = async () => {
    const result = await dispatch(
      updateProfile({
        name,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      setMessage("Profile updated.");
    } else {
      setMessage("Failed to update profile.");
    }
  };

  const removeReview = async (reviewId: number) => {
    try {
      await reviewApi.remove(reviewId);
      setMyReviews((prev) => prev.filter((item) => item.id !== reviewId));
      setMessage("Review removed.");
    } catch {
      setMessage("Failed to remove review.");
    }
  };

  if (!currentUser) {
    return (
      <View style={[sharedStyles.screen, sharedStyles.content]}>
        <Text style={typography.body}>Please log in to view your account.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.content}>
      <AnimatedEntrance style={styles.headerBlock}>
        <SectionHeader title="My Account" subtitle="Manage your profile, identity, and recent community activity." />
        <View style={styles.metrics}>
          <MetricCard label="Role" value={currentUser.role} tone="accent" />
          <MetricCard label="Reviews" value={myReviews.length} />
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={80} style={sharedStyles.card}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.muted}
          style={sharedStyles.input}
        />
        <TextInput
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="Avatar URL"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={sharedStyles.input}
        />
        <TextInput
          value={bio ?? ""}
          onChangeText={setBio}
          placeholder="Bio"
          placeholderTextColor={colors.muted}
          multiline
          style={[sharedStyles.input, sharedStyles.textArea]}
        />
        <Pressable onPress={saveProfile} style={sharedStyles.buttonPrimary} disabled={loading}>
          <Text style={sharedStyles.buttonTextPrimary}>{loading ? "Saving..." : "Save profile"}</Text>
        </Pressable>
        {message ? <Text style={typography.caption}>{message}</Text> : null}
        {error ? <Text style={sharedStyles.errorText}>{error}</Text> : null}
      </AnimatedEntrance>

      <View style={styles.reviewSection}>
        <AnimatedEntrance delay={120}>
          <SectionHeader title="Recent Review Activity" subtitle="Your latest reactions and community contributions." />
        </AnimatedEntrance>
        {reviewsLoading ? <LoadingSpinner /> : null}
        {myReviews.slice(0, 5).map((review, index) => (
          <AnimatedEntrance key={review.id} delay={160 + index * 40}>
            <View style={sharedStyles.softCard}>
              <Text style={typography.body}>Rated {review.rating}/5 on {review.gameTitle}</Text>
              <Text style={typography.subtitle}>{review.comment}</Text>
              <Pressable onPress={() => removeReview(review.id)} style={sharedStyles.buttonDanger}>
                <Text style={sharedStyles.buttonTextDanger}>Delete review</Text>
              </Pressable>
            </View>
          </AnimatedEntrance>
        ))}
        {!myReviews.length && !reviewsLoading ? <Text style={typography.subtitle}>No recent reviews found.</Text> : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerBlock: {
    gap: spacing.md
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  reviewSection: {
    gap: spacing.md
  }
});

export default AccountScreen;
