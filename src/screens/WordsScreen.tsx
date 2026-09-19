/**
 * Maya App - WordsScreen (Tab 1) - NEW ICONS FULL REBUILD
 * Words icon: Feather home
 * Delete: MaterialIcons delete-forever
 * Enter: Feather arrow-right-circle
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { InputBox } from '../components/InputBox';
import { Card } from '../components/Card';
import StorageService, { WordItem } from '../services/storageService';
import TTSService from '../services/ttsService';

export default function WordsScreen() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const stored = await StorageService.getWords().catch(() => []);
        if (!isMounted) return;
        setWords(Array.isArray(stored) ? stored : []);
      } catch (e) {
        if (isMounted) setWords([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    TTSService.init();
    return () => { isMounted = false; };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refresh = async () => {
        try {
          const stored = await StorageService.getWords().catch(() => []);
          if (isActive) setWords(Array.isArray(stored) ? stored : []);
        } catch {}
      };
      refresh();
      return () => { isActive = false; };
    }, [])
  );

  const handleAddWord = useCallback(async (text: string) => {
    try {
      if (!text?.trim()) return;
      const updated = await StorageService.addWord(text);
      setWords(Array.isArray(updated) ? updated : []);
    } catch {}
  }, []);

  const handleDeleteWord = useCallback(async (id: string) => {
    try {
      if (!id) return;
      const updated = await StorageService.deleteWord(id);
      setWords(Array.isArray(updated) ? updated : []);
      TTSService.stop();
    } catch {}
  }, []);

  const handleSpeakWord = useCallback(async (text: string) => {
    try {
      if (!text?.trim()) return;
      const settings = await StorageService.getSettings().catch(() => StorageService.getSettingsSync());
      await TTSService.speakWordAuto(text, settings);
    } catch {}
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: WordItem }) => {
      if (!item) return null;
      return (
        <Card
          text={item?.text || ''}
          onPress={() => handleSpeakWord(item?.text || '')}
          onDelete={() => handleDeleteWord(item?.id || '')}
          variant="word"
        />
      );
    },
    [handleSpeakWord, handleDeleteWord]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.highlight} />
        <Text style={styles.loadingText}>Loading words...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Feather name="home" size={20} color={Colors.highlight} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <InputBox onSubmit={handleAddWord} placeholder="type word... press enter (auto-detect)" />
        </View>
      </View>

      {words.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="home" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No words yet</Text>
          <Text style={styles.emptySubtext}>Type above and press Enter</Text>
          <View style={styles.hintRow}>
            <Feather name="arrow-right-circle" size={16} color={Colors.textMuted} />
            <Text style={styles.emptySubtext}>Tap card to speak auto EN/BN</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item, idx) => item?.id || `word-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          windowSize={10}
        />
      )}

      <View style={styles.footer}>
        <Feather name="home" size={12} color={Colors.textMuted} />
        <Text style={styles.footerText}>{words.length} words • Offline • Auto language</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBase },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 },
  listContent: { paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { color: Colors.textMuted, fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  emptySubtext: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4, opacity: 0.8 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  footer: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  footerText: { color: Colors.textMuted, fontSize: 10 },
});
