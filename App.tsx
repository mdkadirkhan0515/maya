import '@/global.css';
import React from 'react';
import { useColorScheme, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/theme';

const Tab = createBottomTabNavigator();

function WordsScreen() {
  const scheme = useColorScheme()?? 'light';
  return (
    <View style={{ flex: 1, backgroundColor: Colors[scheme].background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors[scheme].text }}>Words Screen - তোমার Words কোড এখানে থাকবে</Text>
    </View>
  );
}
function LearnScreen() {
  const scheme = useColorScheme()?? 'light';
  return (
    <View style={{ flex: 1, backgroundColor: Colors[scheme].background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors[scheme].text }}>Learn Screen</Text>
    </View>
  );
}
function GuideScreen() {
  const scheme = useColorScheme()?? 'light';
  return (
    <View style={{ flex: 1, backgroundColor: Colors[scheme].background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors[scheme].text }}>Guide Screen</Text>
    </View>
  );
}
function SettingsScreen() {
  const scheme = useColorScheme()?? 'light';
  return (
    <View style={{ flex: 1, backgroundColor: Colors[scheme].background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors[scheme].text }}>Settings Screen - System Theme: {scheme}</Text>
    </View>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={isDark? DarkTheme : DefaultTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors[colorScheme?? 'light'].backgroundElement,
            },
          }}
        >
          <Tab.Screen name="Words" component={WordsScreen} />
          <Tab.Screen name="Learn" component={LearnScreen} />
          <Tab.Screen name="Guide" component={GuideScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
