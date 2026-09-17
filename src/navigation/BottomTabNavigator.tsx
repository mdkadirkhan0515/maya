/**
 * Maya App - BottomTabNavigator - NEW ICONS (SDK 57)
 * Words: Feather home
 * Learn: SimpleLineIcons book-open
 * Guide: FontAwesome5 book
 * Settings: Ionicons settings-outline
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';

import WordsScreen from '../screens/WordsScreen';
import LearnScreen from '../screens/LearnScreen';
import GuideScreen from '../screens/GuideScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootTabParamList = {
  Words: undefined;
  Learn: undefined;
  Guide: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.darkBase,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.highlight,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Words"
        component={WordsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name="home" size={focused ? size + 2 : size} color={color} />
          ),
          tabBarLabel: 'Words',
        }}
      />

      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <SimpleLineIcons name="book-open" size={focused ? size + 2 : size} color={color} />
          ),
          tabBarLabel: 'Learn',
        }}
      />

      <Tab.Screen
        name="Guide"
        component={GuideScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome5 name="book" size={focused ? size + 2 : size} color={color} />
          ),
          tabBarLabel: 'Guide',
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="settings-outline" size={focused ? size + 2 : size} color={color} />
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
