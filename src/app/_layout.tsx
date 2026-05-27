import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { CapsuleProvider } from '@/context/CapsuleContext';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <CapsuleProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="capsule/[id]" />
          <Stack.Screen name="section/[category]" />
        </Stack>
      </CapsuleProvider>
    </ThemeProvider>
  );
}


