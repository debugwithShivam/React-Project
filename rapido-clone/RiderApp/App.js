import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { UserProvider } from './src/context/UserContext';
import { RideProvider } from './src/context/RideContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function MainApp() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <RideProvider>
            <MainApp />
          </RideProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
