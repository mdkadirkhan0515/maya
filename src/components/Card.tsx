/**
 * Maya App - Card.tsx - NEW ICONS
 * Delete: MaterialIcons delete-forever
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export interface CardProps {
  text?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isActive?: boolean;
  showDelete?: boolean;
  disabled?: boolean;
  variant?: 'word' | 'learn' | 'mcq';
}

export const Card: React.FC<CardProps> = ({
  text,
  children,
  onPress,
  onDelete,
  style,
  textStyle,
  isActive = false,
  showDelete = false,
  disabled = false,
  variant = 'word',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActive && styles.cardActive,
        disabled && styles.cardDisabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.content}>
        {text ? (
          <Text 
            style={[styles.text, textStyle]} 
            numberOfLines={variant === 'word' ? 2 : undefined}
          >
            {text}
          </Text>
        ) : (
          children
        )}
      </View>

      {(onDelete || showDelete) && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="delete-forever" size={24} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export interface MCQCardProps {
  question: string;
  options: { a: string; b: string; c: string; d: string };
  answer?: 'a' | 'b' | 'c' | 'd';
  onPress?: () => void;
  isActive?: boolean;
  mode?: 0 | 1 | 2 | 3;
}

export const MCQCard: React.FC<MCQCardProps> = ({
  question,
  options,
  onPress,
  isActive = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, styles.mcqCard, isActive && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.optionsGrid}>
        {(Object.keys(options) as Array<keyof typeof options>).map((key) => (
          <View key={key} style={styles.optionBox}>
            <Text style={styles.optionLabel}>{key})</Text>
            <Text style={styles.optionText}>{options[key]}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export interface LearnCardProps {
  englishText: string;
  bengaliMeaning: string;
  serialNumber?: string;
  onPress?: () => void;
  isActive?: boolean;
}

export const LearnCard: React.FC<LearnCardProps> = ({
  englishText,
  bengaliMeaning,
  serialNumber,
  onPress,
  isActive = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, styles.learnCard, isActive && styles.cardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {serialNumber && <Text style={styles.serialNumber}>#{serialNumber}</Text>}
      <Text style={styles.englishText}>{englishText}</Text>
      <Text style={styles.bengaliText}>{bengaliMeaning}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: {
    borderColor: Colors.highlight,
    borderWidth: 1.5,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  mcqCard: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionBox: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionLabel: {
    color: Colors.highlight,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  learnCard: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  serialNumber: {
    color: Colors.highlight,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  englishText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  bengaliText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Card;
