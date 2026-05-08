import { StyleSheet, Text, View } from "react-native";
import { spacing, typography } from "../theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={typography.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={typography.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  }
});

export default SectionHeader;
