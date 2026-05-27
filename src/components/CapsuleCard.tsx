import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { Capsule } from '../types/capsule';

interface CapsuleCardProps {
  capsule: Capsule;
}

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/capsule/${capsule.id}` as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.pressed
      ]}
    >
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="code" style={styles.category} themeColor="textSecondary">
            {capsule.category.toUpperCase()}
          </ThemedText>
          <ThemedText type="code" style={styles.readTime} themeColor="textSecondary">
            {capsule.readTime}
          </ThemedText>
        </View>

        <ThemedText type="default" style={styles.title}>
          {capsule.title}
        </ThemedText>

        <ThemedText type="small" style={styles.description} themeColor="textSecondary">
          {capsule.shortDescription}
        </ThemedText>

        <View style={styles.footer}>
          <ThemedText type="code" style={styles.readLink}>
            Read Capsule →
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: Spacing.two,
    alignSelf: 'stretch',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E3135',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  category: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  readTime: {
    fontSize: 11,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#B0B4BA',
    marginTop: Spacing.one,
  },
  footer: {
    marginTop: Spacing.two,
    alignItems: 'flex-start',
  },
  readLink: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
