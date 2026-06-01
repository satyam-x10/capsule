import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { CapsuleProvider } from '@/context/CapsuleContext';

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={AppDarkTheme}>
      <CapsuleProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
          <Stack.Screen name="index" />
        </Stack>
      </CapsuleProvider>
    </ThemeProvider>
  );
}


