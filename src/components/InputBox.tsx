/**
 * Maya App - InputBox.tsx - NEW ICONS
 * Enter: Feather arrow-right-circle
 * Home: Feather home
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '../constants/theme';

interface InputBoxProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  value?: string;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSubmit, placeholder = 'type word...', value }) => {
  const [text, setText] = useState(value || '');

  const handleSubmit = () => {
    if (!text?.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Feather name="home" size={18} color={Colors.textMuted} style={styles.leftIcon} />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.enterBtn} activeOpacity={0.7}>
          <Feather name="arrow-right-circle" size={22} color={Colors.highlight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 14,
  },
  enterBtn: {
    padding: 6,
    marginLeft: 8,
  },
});

export default InputBox;
