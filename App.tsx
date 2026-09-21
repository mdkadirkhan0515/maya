import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { Colors } from './src/constants/theme';
import TTSService from './src/services/ttsService';

export default function App() {
  useEffect(() => { TTSService.init().catch(()=>{}); }, []);
  
  const MyTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.highlight,
      background: Colors.darkBase,
      card: Colors.cardBg,
      text: Colors.textDarkMode,
      border: Colors.border,
      notification: Colors.highlight,
    },
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBase }}>
        <NavigationContainer theme={MyTheme}>
          <StatusBar backgroundColor={Colors.darkBase} barStyle="light-content" />
          <BottomTabNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

