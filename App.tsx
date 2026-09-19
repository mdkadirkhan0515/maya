import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { Colors } from './src/constants/theme';
import TTSService from './src/services/ttsService';

LogBox.ignoreLogs(['Non-serializable values']);

export default function App() {
  useEffect(() => {
    TTSService.init().catch(() => {});
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.highlight,
          background: Colors.darkBase,
          card: Colors.cardBg,
          text: '#FFFFFF',
          border: Colors.border,
          notification: Colors.highlight,
        },
      }}
    >
      <StatusBar backgroundColor={Colors.darkBase} barStyle="light-content" />
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
