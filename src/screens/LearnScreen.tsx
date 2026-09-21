/**
 * Maya App - LearnScreen (Tab 2) - NEW ICONS FULL REBUILD
 * Back: Ionicons arrow-back-circle-outline
 * Enter: Feather arrow-right-circle
 * Tick boxes: MaterialIcons check-box-outline-blank
 * Learn icon: SimpleLineIcons book-open
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons, SimpleLineIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { LearnCard } from '../components/Card';
import type { Chapter, Lesson, EnglishLearningBook } from '../types/bookTypes';
import StorageService from '../services/storageService';
import TTSService from '../services/ttsService';

type TickMode = 0 | 1 | 2 | 3;

const SAMPLE_BOOK: EnglishLearningBook = {
  bookTitle: 'English Learning Book (Sample)',
  chapters: [
    {
      chapterId: '1',
      chapterTitle: 'অধ্যায় ১: মৌলিক ইংরেজি বাক্য',
      lessons: [
        { serialNumber: '1', englishText: 'A quick brown fox jumped over the lazy dogs.', bengaliMeaning: 'একটি দ্রুতগামী বাদামী শেয়াল অলস কুকুরগুলোর উপর দিয়ে লাফিয়ে পার হয়ে গেল।' },
        { serialNumber: '2', englishText: 'Honesty is the best policy.', bengaliMeaning: 'সততাই সর্বোৎকৃষ্ট পন্থা।' },
        { serialNumber: '3', englishText: 'I love you', bengaliMeaning: '' },
        { serialNumber: '4', englishText: '', bengaliMeaning: 'আমি তোমাকে ভালোবাসি' },
      ],
    },
  ],
};

export default function LearnScreen() {
  const [book, setBook] = useState<EnglishLearningBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeTick, setActiveTick] = useState<TickMode>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const autoPlayRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const stored = await StorageService.getLearnBook();
        if (!isMounted) return;
        if (stored && Array.isArray(stored?.chapters) && stored.chapters.length > 0) {
          setBook(stored);
        } else {
          setBook(SAMPLE_BOOK);
        }
      } catch (e) {
        console.log('Learn load error', e);
        if (isMounted) setBook(SAMPLE_BOOK);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    TTSService.init();
    return () => {
      isMounted = false;
      TTSService.stop();
      autoPlayRef.current = false;
    };
  }, []);

  const handleTickPress = useCallback((tickNum: TickMode) => {
    setActiveTick((prev) => (prev === tickNum ? 0 : tickNum));
    try { TTSService.stop(); } catch {}
    autoPlayRef.current = false;
    setIsAutoPlaying(false);
    setCurrentIndex(-1);
  }, []);

  const handleChapterPress = useCallback((chapter: Chapter) => {
    if (!chapter || !Array.isArray(chapter?.lessons)) return;
    setSelectedChapter(chapter);
    setCurrentIndex(-1);
    try { TTSService.stop(); } catch {}
  }, []);

  const handleLessonPress = useCallback(
    async (lesson: Lesson, index: number) => {
      try {
        if (!lesson) return;
        const settings = await StorageService.getSettings().catch(() => StorageService.getSettingsSync());
        TTSService.stop();
        autoPlayRef.current = false;
        setIsAutoPlaying(false);
        setCurrentIndex(index);

        if (activeTick === 0) {
          await TTSService.speakLearnAuto(lesson, settings as any);
        } else if (activeTick === 1) {
          await TTSService.speak(lesson?.englishText || '', { speed: (settings as any)?.speed, pitch: (settings as any)?.pitch, language: 'en-US' });
        } else {
          const lessons = selectedChapter?.lessons || [];
          if (lessons.length === 0) return;
          autoPlayRef.current = true;
          setIsAutoPlaying(true);
          await TTSService.speakLearnSequenceAuto(lessons, index, settings as any, (i) => setCurrentIndex(i), () => autoPlayRef.current);
          autoPlayRef.current = false;
          setIsAutoPlaying(false);
        }
      } catch (e) {
        console.log('Lesson press error', e);
        setIsAutoPlaying(false);
        autoPlayRef.current = false;
      }
    },
    [activeTick, selectedChapter]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.highlight} />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  const chapters = book?.chapters || [];
  const hasData = chapters.length > 0;

  if (!selectedChapter) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <SimpleLineIcons name="book-open" size={24} color={Colors.highlight} />
            <Text style={styles.headerTitle}>{book?.bookTitle || 'English Learning Book'}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {hasData ? `${chapters.length} chapters • Auto UX` : 'No data'}
          </Text>
        </View>

        {!hasData ? (
          <View style={styles.emptyBox}>
            <SimpleLineIcons name="book-open" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No lessons found</Text>
          </View>
        ) : (
          <FlatList
            data={chapters}
            keyExtractor={(item, idx) => item?.chapterId || `ch-${idx}`}
            renderItem={({ item }) => {
              if (!item) return null;
              return (
                <TouchableOpacity style={styles.chapterRow} onPress={() => handleChapterPress(item)} activeOpacity={0.7}>
                  <View style={styles.chapterLeft}>
                    <Text style={styles.chapterId}>#{item.chapterId || '?'}</Text>
                    <Text style={styles.chapterTitle}>{item.chapterTitle || 'Untitled'}</Text>
                    <Text style={styles.chapterCount}>{Array.isArray(item.lessons) ? item.lessons.length : 0} lessons</Text>
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

  const lessons = selectedChapter?.lessons || [];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setSelectedChapter(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back-circle-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleSmall} numberOfLines={1}>
            {selectedChapter?.chapterTitle || 'Lessons'}
          </Text>
        </View>

        <View style={styles.tickRow}>
          <View style={[styles.tickBox, activeTick === 0 && styles.tickActive]}>
            <MaterialIcons name="check-box-outline-blank" size={16} color={activeTick === 0 ? Colors.darkBase : Colors.textMuted} />
            <Text style={[styles.tickText, activeTick === 0 && styles.tickTextActive]}>Auto</Text>
          </View>
          {([1, 2, 3] as TickMode[]).map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => handleTickPress(num)}
              style={[styles.tickBox, activeTick === num && styles.tickActive]}
            >
              <MaterialIcons name="check-box-outline-blank" size={16} color={activeTick === num ? Colors.darkBase : Colors.textMuted} />
              <Text style={[styles.tickText, activeTick === num && styles.tickTextActive]}>Tick{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item, idx) => item?.serialNumber || `lesson-${idx}`}
        renderItem={({ item, index }) => {
          if (!item) return null;
          return (
            <LearnCard
              englishText={item.englishText || ''}
              bengaliMeaning={item.bengaliMeaning || ''}
              serialNumber={item.serialNumber}
              onPress={() => handleLessonPress(item, index)}
              isActive={currentIndex === index}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {isAutoPlaying && (
        <View style={styles.autoBar}>
          <Feather name="arrow-right-circle" size={16} color={Colors.highlight} />
          <Text style={styles.autoText}>Auto-playing Tick{activeTick}</Text>
          <TouchableOpacity onPress={() => { autoPlayRef.current = false; try { TTSService.stop(); } catch {}; setIsAutoPlaying(false); }} style={styles.stopBtn}>
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
  headerTitleSmall: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1, marginLeft: 12 },
  headerSubtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 4 },
  tickRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  tickBox: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tickActive: { backgroundColor: Colors.highlight, borderColor: Colors.highlight },
  tickText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  tickTextActive: { color: Colors.darkBase },
  chapterRow: { backgroundColor: Colors.cardBg, borderRadius: 12, padding: 16, marginVertical: 6, marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  chapterLeft: { flex: 1 },
  chapterId: { color: Colors.highlight, fontSize: 11, fontWeight: '700' },
  chapterTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginTop: 2 },
  chapterCount: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginTop: 12 },
  autoBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, padding: 12, borderTopWidth: 1, borderTopColor: Colors.highlight, gap: 8 },
  autoText: { color: Colors.textMuted, fontSize: 11, flex: 1 },
  stopBtn: { backgroundColor: Colors.delete, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  stopText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
