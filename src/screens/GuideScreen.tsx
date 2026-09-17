/**
 * Maya App - GuideScreen (Tab 3) - NEW ICONS FULL REBUILD
 * Back: Ionicons arrow-back-circle-outline
 * Enter: Feather arrow-right-circle
 * Tick boxes: MaterialIcons check-box-outline-blank
 * Guide icon: FontAwesome5 book
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '../constants/theme';
import type { Page, MCQ, GrammarMasterBook } from '../types/bookTypes';
import StorageService from '../services/storageService';
import TTSService from '../services/ttsService';

type TickMode = 0 | 1 | 2 | 3;

const SAMPLE_GUIDE: GrammarMasterBook = {
  bookTitle: 'English Grammar Master',
  pages: [
    {
      pageNumber: '129',
      mcqs: [
        {
          serialNumber: '8',
          questionText: "The word 'difficult' in its superlative form —",
          options: { a: 'most difficult', b: 'very difficult', c: 'difficultest', d: 'very very difficult' },
          answer: 'a',
        },
      ],
    },
  ],
};

export default function GuideScreen() {
  const [book, setBook] = useState<GrammarMasterBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [activeTick, setActiveTick] = useState<TickMode>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const autoPlayRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const stored = await StorageService.getGuideBook();
        if (!isMounted) return;
        if (stored && Array.isArray(stored?.pages) && stored.pages.length > 0) {
          setBook(stored);
        } else {
          setBook(SAMPLE_GUIDE);
        }
      } catch (e) {
        if (isMounted) setBook(SAMPLE_GUIDE);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    TTSService.init();
    return () => {
      isMounted = false;
      try { TTSService.stop(); } catch {}
      autoPlayRef.current = false;
    };
  }, []);

  const handleTickPress = useCallback((num: TickMode) => {
    setActiveTick((prev) => (prev === num ? 0 : num));
    try { TTSService.stop(); } catch {}
    autoPlayRef.current = false;
    setIsAutoPlaying(false);
    setCurrentIndex(-1);
  }, []);

  const handleMCQPress = useCallback(
    async (mcq: MCQ, index: number) => {
      try {
        if (!mcq) return;
        const settings = await StorageService.getSettings().catch(() => StorageService.getSettingsSync());
        TTSService.stop();
        setCurrentIndex(index);

        if (activeTick === 0) {
          await TTSService.speakGuideAuto(mcq, settings as any, 'question+options');
        } else if (activeTick === 1) {
          await TTSService.speakGuideAuto(mcq, settings as any, 'question+answer');
        } else {
          const mcqs = selectedPage?.mcqs || [];
          if (mcqs.length === 0) return;
          autoPlayRef.current = true;
          setIsAutoPlaying(true);
          const mode = activeTick === 2 ? 'question+options' : 'question+answer';
          await TTSService.speakGuideSequenceAuto(mcqs, index, settings as any, mode as any, (i) => setCurrentIndex(i), () => autoPlayRef.current);
          autoPlayRef.current = false;
          setIsAutoPlaying(false);
        }
      } catch (e) {
        setIsAutoPlaying(false);
        autoPlayRef.current = false;
      }
    },
    [activeTick, selectedPage]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.highlight} />
        <Text style={styles.loadingText}>Loading MCQs...</Text>
      </View>
    );
  }

  const pages = book?.pages || [];
  const hasData = pages.length > 0;

  if (!selectedPage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <FontAwesome5 name="book" size={24} color={Colors.highlight} />
            <Text style={styles.headerTitle}>{book?.bookTitle || 'Grammar Master'}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{hasData ? `${pages.length} pages` : 'No data'}</Text>
        </View>

        {!hasData ? (
          <View style={styles.emptyBox}>
            <FontAwesome5 name="book" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No pages found</Text>
          </View>
        ) : (
          <FlatList
            data={pages}
            keyExtractor={(item, idx) => item?.pageNumber || `page-${idx}`}
            renderItem={({ item }) => {
              if (!item) return null;
              return (
                <TouchableOpacity style={styles.pageRow} onPress={() => setSelectedPage(item)} activeOpacity={0.7}>
                  <View>
                    <Text style={styles.pageNumber}>Page {item.pageNumber || '?'}</Text>
                    <Text style={styles.pageCount}>{Array.isArray(item.mcqs) ? item.mcqs.length : 0} MCQs</Text>
                  </View>
                  <Feather name="arrow-right-circle" size={24} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    );
  }

  const mcqs = selectedPage?.mcqs || [];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setSelectedPage(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back-circle-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleSmall}>Page {selectedPage?.pageNumber || '?'}</Text>
        </View>

        <View style={styles.tickRow}>
          <View style={[styles.tickBox, activeTick === 0 && styles.tickActive]}>
            <MaterialIcons name="check-box-outline-blank" size={16} color={activeTick === 0 ? Colors.darkBase : Colors.textMuted} />
            <Text style={[styles.tickText, activeTick === 0 && styles.tickTextActive]}>Auto</Text>
          </View>
          {([1, 2, 3] as TickMode[]).map((num) => (
            <TouchableOpacity key={num} onPress={() => handleTickPress(num)} style={[styles.tickBox, activeTick === num && styles.tickActive]}>
              <MaterialIcons name="check-box-outline-blank" size={16} color={activeTick === num ? Colors.darkBase : Colors.textMuted} />
              <Text style={[styles.tickText, activeTick === num && styles.tickTextActive]}>Tick{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={mcqs}
        keyExtractor={(item, idx) => item?.serialNumber || `mcq-${idx}`}
        renderItem={({ item, index }) => {
          if (!item) return null;
          const opts = item?.options || { a: '', b: '', c: '', d: '' };
          return (
            <TouchableOpacity style={[styles.mcqCard, currentIndex === index && styles.mcqActive]} onPress={() => handleMCQPress(item, index)} activeOpacity={0.8}>
              <Text style={styles.qText}>#{item.serialNumber || index} {item.questionText || ''}</Text>
              <View style={styles.grid}>
                {Object.entries(opts).map(([key, val]) => (
                  <View key={key} style={styles.optBox}>
                    <Text style={styles.optLabel}>{key})</Text>
                    <Text style={styles.optText}>{String(val || '')}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {isAutoPlaying && (
        <View style={styles.autoBar}>
          <Feather name="arrow-right-circle" size={16} color={Colors.highlight} />
          <Text style={styles.autoText}>Auto-playing Tick{activeTick}</Text>
          <TouchableOpacity onPress={() => { autoPlayRef.current = false; try{ TTSService.stop(); }catch{}; setIsAutoPlaying(false); }} style={styles.stopBtn}>
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBase },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  listContent: { paddingBottom: 20 },
  header: { backgroundColor: Colors.darkBase, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', flex: 1 },
  headerTitleSmall: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1, marginLeft: 12 },
  headerSubtitle: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 4 },
  tickRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  tickBox: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tickActive: { backgroundColor: Colors.highlight, borderColor: Colors.highlight },
  tickText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  tickTextActive: { color: Colors.darkBase },
  pageRow: { backgroundColor: Colors.cardBg, borderRadius: 12, padding: 16, marginVertical: 6, marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  pageNumber: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  pageCount: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  mcqCard: { backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14, marginVertical: 6, marginHorizontal: 16, borderWidth: 1, borderColor: Colors.border },
  mcqActive: { borderColor: Colors.highlight, borderWidth: 1.5 },
  qText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginBottom: 10, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optBox: { width: '48%', backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 10, marginVertical: 4, flexDirection: 'row' },
  optLabel: { color: Colors.highlight, fontSize: 12, fontWeight: '700', marginRight: 6 },
  optText: { color: '#FFFFFF', fontSize: 12, flex: 1 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 12 },
  autoBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, padding: 12, borderTopWidth: 1, borderTopColor: Colors.highlight, gap: 8 },
  autoText: { color: Colors.textMuted, fontSize: 11, flex: 1 },
  stopBtn: { backgroundColor: Colors.delete, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  stopText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
