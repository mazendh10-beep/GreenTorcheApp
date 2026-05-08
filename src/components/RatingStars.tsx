import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface RatingStarsProps {
  rating: number;
}

const RatingStars = ({ rating }: RatingStarsProps) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={star <= Math.round(rating) ? styles.active : styles.inactive}>
          ★
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  active: {
    color: "#f6c453",
    fontSize: 15
  },
  inactive: {
    color: colors.muted,
    opacity: 0.4,
    fontSize: 15
  }
});

export default RatingStars;
