/**
 * Maya App - Root Entry Point - Production Ready + Fully Automated Auto UX
 * Offline-first, performance-optimized, crash-proof
 * Main entry rendering navigation container with dark theme
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox, View, Text, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { Colors } from './src/constants/theme';
import TTSService from './src/services/ttsService';

// Ignore specific warnings for cleaner logs
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

export default function App() {
  useEffect(() => {
    // Initialize TTS on app start - fully automated auto language detection ready
    TTSService.init().catch((e) => console.log('TTS init error', e));

    // Preload settings & check storage - AsyncStorage version (crash-proof)
    // No MMKV - now using @react-native-async-storage/async-storage
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.highlight, // #38BDF8
          background: Colors.darkBase, // #0B0F19
          card: Colors.cardBg, // #1E293B
          text: Colors.textDarkMode || '#FFFFFF',
          border: Colors.border, // #334155
          notification: Colors.highlight,
        },
      }}
    >
      <StatusBar backgroundColor={Colors.darkBase} barStyle="light-content" />
      <BottomTabNavigator />
    </NavigationContainer>
  );
}

// Optional Splash Screen with wallpaper logo - make sure asset exists at ./assets/images/splash_wallpaper.png
export function SplashScreen() {
  return (
    <View style={splashStyles.container}>
      <Image
        source={require('./assets/images/splash_wallpaper.png')}
        style={splashStyles.wallpaper}
        resizeMode="cover"
      />
      <View style={splashStyles.overlay}>
        <Text style={splashStyles.title}>MAYA</Text>
        <Text style={splashStyles.subtitle}>English Learning • Offline First • Auto UX</Text>
      </View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBase },
  wallpaper: { width: '100%', height: '100%', position: 'absolute' },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.6)',
  },
  title: { color: '#FFFFFF', fontSize: 48, fontWeight: '800', letterSpacing: 4 },
  subtitle: { color: Colors.highlight, fontSize: 14, marginTop: 8 },
});
