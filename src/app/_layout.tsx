import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="revisions" />
        <Stack.Screen name="capsule/[id]" />
        <Stack.Screen name="section/[category]" />
      </Stack>
    </ThemeProvider>
  );
}


