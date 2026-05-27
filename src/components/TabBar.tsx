import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  // Normalize pathname to check active tab
  const isHome = pathname === '/' || pathname === '/index';
  const isRevisions = pathname === '/revisions';

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Pressable
          onPress={() => router.replace('/')}
          style={[styles.tab, isHome && styles.activeTab]}
        >
          <ThemedText
            type="smallBold"
            style={styles.tabText}
            themeColor={isHome ? 'text' : 'textSecondary'}
          >
            Home
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/revisions')}
          style={[styles.tab, isRevisions && styles.activeTab]}
        >
          <ThemedText
            type="smallBold"
            style={styles.tabText}
            themeColor={isRevisions ? 'text' : 'textSecondary'}
          >
            Revisions
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    paddingHorizontal: Spacing.four,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 29, 31, 0.85)', // Translucent developer dark
    borderWidth: 1,
    borderColor: 'rgba(46, 49, 53, 0.8)',
    borderRadius: 30,
    padding: Spacing.one,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      },
    }),
    gap: Spacing.one,
  },
  tab: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2E3135',
  },
  tabText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
