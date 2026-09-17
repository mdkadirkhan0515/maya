/**
 * Maya App - SettingItem.tsx - NEW ICONS
 * Plus/minus: Feather arrow-right-circle for enter, but keep add/remove for control
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '../constants/theme';

export interface SettingItemProps {
  title: string;
  value: number | string;
  onIncrease: () => void;
  onDecrease: () => void;
  unit?: string;
  style?: ViewStyle;
  min?: number;
  max?: number;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  title,
  value,
  onIncrease,
  onDecrease,
  unit = '',
  style,
  min,
  max,
}) => {
  const isMinReached = typeof value === 'number' && typeof min === 'number' ? value <= min : false;
  const isMaxReached = typeof value === 'number' && typeof max === 'number' ? value >= max : false;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={onDecrease} 
          style={[styles.btn, isMinReached && styles.btnDisabled]} 
          activeOpacity={0.7}
          disabled={isMinReached}
        >
          <MaterialIcons name="check-box-outline-blank" size={18} color={isMinReached ? Colors.textMuted : "#FFFFFF"} />
        </TouchableOpacity>

        <View style={styles.valueBox}>
          <Text style={styles.valueText}>
            {typeof value === 'number' ? value.toFixed(1) : value} {unit}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={onIncrease} 
          style={[styles.btn, isMaxReached && styles.btnDisabled]} 
          activeOpacity={0.7}
          disabled={isMaxReached}
        >
          <Feather name="arrow-right-circle" size={18} color={isMaxReached ? Colors.textMuted : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { color: '#FFFFFF', fontSize: 13, flex: 1, marginRight: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: {
    backgroundColor: Colors.border,
    borderRadius: 8,
    padding: 6,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
    backgroundColor: '#1E293B',
  },
  valueBox: {
    backgroundColor: Colors.darkBase,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.highlight,
  },
  valueText: { color: Colors.highlight, fontWeight: '700', fontSize: 12 },
});

export default SettingItem;
