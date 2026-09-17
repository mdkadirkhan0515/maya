/**
 * Maya App - Header.tsx - NEW ICONS FULL REBUILD
 * Back: Ionicons arrow-back-circle-outline
 * Icons: Feather, Ionicons, SimpleLineIcons, FontAwesome5
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBack, onBack, rightIcon }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.darkBase} barStyle="light-content" />
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back-circle-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.titleBox}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={styles.rightBox}>{rightIcon}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkBase,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  spacer: { width: 32 },
  titleBox: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  subtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  rightBox: { width: 32, alignItems: 'flex-end' },
});

export default Header;
