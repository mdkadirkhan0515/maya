import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { Colors } from './src/constants/theme';

export default function App(){
  return (
    <NavigationContainer theme={{
      dark: true,
      colors: {
        primary: Colors.highlight,
        background: Colors.darkBase,
        card: Colors.cardBg,
        text: Colors.textDarkMode,
        border: Colors.border,
        notification: Colors.highlight
      }
    }}>
      <StatusBar backgroundColor={Colors.darkBase} barStyle="light-content" />
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
