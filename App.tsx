import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { Colors } from './src/constants/theme';
import TTSService from './src/services/ttsService';

export default function App() {
  useEffect(() => {
    // TTS Crash-proof init
    TTSService.init().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: Colors.highlight,
            background: Colors.darkBase,
            card: Colors.cardBg,
            text: Colors.textDarkMode,
            border: Colors.border,
            notification: Colors.highlight,
          },
        }}
      >
        <StatusBar backgroundColor={Colors.darkBase} barStyle="light-content" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
