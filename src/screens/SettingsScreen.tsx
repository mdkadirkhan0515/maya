/**
 * Maya App - SettingsScreen (Tab 4) - NEW ICONS FULL REBUILD
 * Settings: Ionicons settings-outline
 * Delete: MaterialIcons delete-forever
 * Enter: Feather arrow-right-circle
 * Back: Ionicons arrow-back-circle-outline
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Colors } from '../constants/theme';
import { SettingItem } from '../components/SettingItem';
import StorageService, { AppSettings } from '../services/storageService';
import GithubService from '../services/githubService';
import type { StoredJsonFile } from '../types/bookTypes';

const DEFAULT_FALLBACK: AppSettings = {
  speed: 0.5,
  pitch: 1.0,
  language: 'en-US',
  delayQuestionToOptions: 1.5,
  delayBetweenOptions: 0.8,
  delayTickAnswer: 1.0,
  theme: 'dark',
  githubUrls: { learnUrl: '', guideUrl: '' },
  autoPlayEnabled: false,
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_FALLBACK);
  const [jsonFiles, setJsonFiles] = useState<StoredJsonFile[]>([]);
  const [learnUrlInput, setLearnUrlInput] = useState('');
  const [guideUrlInput, setGuideUrlInput] = useState('');
  const [previewLearn, setPreviewLearn] = useState<{ valid: boolean; title?: string; count?: number; error?: string } | null>(null);
  const [previewGuide, setPreviewGuide] = useState<{ valid: boolean; title?: string; count?: number; error?: string } | null>(null);
  const [loading, setLoading] = useState<'learn' | 'guide' | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setInitialLoading(true);
        const [storedSettings, storedFiles] = await Promise.all([
          StorageService.getSettings().catch(() => DEFAULT_FALLBACK),
          StorageService.getJsonFiles().catch(() => []),
        ]);
        if (!isMounted) return;
        const safeSettings = storedSettings || DEFAULT_FALLBACK;
        if (!safeSettings.githubUrls) safeSettings.githubUrls = { learnUrl: '', guideUrl: '' };
        setSettings(safeSettings);
        setLearnUrlInput(safeSettings.githubUrls?.learnUrl || '');
        setGuideUrlInput(safeSettings.githubUrls?.guideUrl || '');
        setJsonFiles(Array.isArray(storedFiles) ? storedFiles : []);
      } catch {
        if (isMounted) {
          setSettings(DEFAULT_FALLBACK);
          setJsonFiles([]);
        }
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    try {
      const updated = await StorageService.updateSetting(key, value);
      if (updated) setSettings(updated);
    } catch {
      setSettings(prev => ({ ...prev, [key]: value } as AppSettings));
    }
  }, []);

  const handlePreview = async (type: 'learn' | 'guide') => {
    try {
      const url = type === 'learn' ? learnUrlInput : guideUrlInput;
      if (!url?.trim()) { Alert.alert('URL empty'); return; }
      setLoading(type);
      const result = await GithubService.previewUrl(url);
      if (type === 'learn') setPreviewLearn(result);
      else setPreviewGuide(result);
    } catch (e: any) {
      const err = { valid: false, error: e?.message || 'Preview failed' };
      if (type === 'learn') setPreviewLearn(err);
      else setPreviewGuide(err);
    } finally {
      setLoading(null);
    }
  };

  const handleSaveUrls = async () => {
    try {
      const updated = await StorageService.updateGithubUrls({
        learnUrl: (learnUrlInput || '').trim(),
        guideUrl: (guideUrlInput || '').trim(),
      });
      if (updated) {
        setSettings(updated);
        Alert.alert('Saved', 'GitHub URLs saved');
      }
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Error');
    }
  };

  const handleDownload = async (type: 'learn' | 'guide') => {
    try {
      const url = type === 'learn' ? learnUrlInput : guideUrlInput;
      if (!url?.trim()) { Alert.alert('URL empty'); return; }
      setLoading(type);
      const result = await GithubService.downloadAsStoredFile(url);
      if (result.success && result.data) {
        const updatedFiles = await StorageService.saveJsonFile(result.data);
        setJsonFiles(Array.isArray(updatedFiles) ? updatedFiles : []);
        Alert.alert('Downloaded', `${result.data.name}`);
      } else {
        Alert.alert('Failed', result.error || 'Download error');
      }
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Download error');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteJson = async (name: string) => {
    try {
      if (!name) return;
      const updated = await StorageService.deleteJsonFile(name);
      setJsonFiles(Array.isArray(updated) ? updated : []);
    } catch {}
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.highlight} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  const safeJsonFiles = Array.isArray(jsonFiles) ? jsonFiles : [];
  const safeSpeed = settings?.speed ?? 0.5;
  const safePitch = settings?.pitch ?? 1.0;
  const safeDelayQ = settings?.delayQuestionToOptions ?? 1.5;
  const safeDelayBetween = settings?.delayBetweenOptions ?? 0.8;
  const safeDelayTick = settings?.delayTickAnswer ?? 1.0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={24} color={Colors.highlight} />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <Text style={styles.sectionTitle}>GitHub URLs • Offline JSON</Text>

      <View style={styles.urlCard}>
        <View style={styles.labelRow}>
          <SimpleLineIcons name="book-open" size={16} color={Colors.highlight} />
          <Text style={styles.urlLabel}>Learn Book URL (english_learning_book.json)</Text>
        </View>
        <TextInput value={learnUrlInput} onChangeText={setLearnUrlInput} style={styles.urlInput} placeholder="https://raw.githubusercontent.com/..." placeholderTextColor={Colors.textMuted} multiline />
        <View style={styles.urlActions}>
          <TouchableOpacity onPress={() => handlePreview('learn')} style={styles.previewBtn}>
            {loading === 'learn' ? <ActivityIndicator size="small" color={Colors.darkBase} /> : <Feather name="arrow-right-circle" size={16} color={Colors.darkBase} />}
            <Text style={styles.previewText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDownload('learn')} style={styles.downloadBtn}>
            {loading === 'learn' ? <ActivityIndicator size="small" color="#FFF" /> : <FontAwesome5 name="book" size={14} color="#FFF" />}
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>
        {previewLearn && <Text style={[styles.previewResult, previewLearn.valid ? styles.valid : styles.invalid]}>{previewLearn.valid ? `✓ ${previewLearn.title || 'Valid'}` : `✗ ${previewLearn.error || 'Invalid'}`}</Text>}
      </View>

      <View style={styles.urlCard}>
        <View style={styles.labelRow}>
          <FontAwesome5 name="book" size={16} color={Colors.highlight} />
          <Text style={styles.urlLabel}>Guide Book URL (grammar_master.json)</Text>
        </View>
        <TextInput value={guideUrlInput} onChangeText={setGuideUrlInput} style={styles.urlInput} placeholder="https://raw.githubusercontent.com/..." placeholderTextColor={Colors.textMuted} multiline />
        <View style={styles.urlActions}>
          <TouchableOpacity onPress={() => handlePreview('guide')} style={styles.previewBtn}>
            {loading === 'guide' ? <ActivityIndicator size="small" color={Colors.darkBase} /> : <Feather name="arrow-right-circle" size={16} color={Colors.darkBase} />}
            <Text style={styles.previewText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDownload('guide')} style={styles.downloadBtn}>
            {loading === 'guide' ? <ActivityIndicator size="small" color="#FFF" /> : <FontAwesome5 name="book" size={14} color="#FFF" />}
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>
        {previewGuide && <Text style={[styles.previewResult, previewGuide.valid ? styles.valid : styles.invalid]}>{previewGuide.valid ? `✓ ${previewGuide.title || 'Valid'}` : `✗ ${previewGuide.error || 'Invalid'}`}</Text>}
      </View>

      <TouchableOpacity onPress={handleSaveUrls} style={styles.saveUrlsBtn}>
        <Feather name="arrow-right-circle" size={18} color={Colors.darkBase} />
        <Text style={styles.saveUrlsText}>Save URLs</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>JSON Books • {safeJsonFiles.length} files</Text>
      {safeJsonFiles.length === 0 ? (
        <Text style={styles.emptyText}>No JSON yet. Download করলে কার্ড আসবে।</Text>
      ) : (
        safeJsonFiles.map((file, idx) => {
          if (!file) return null;
          return (
            <View key={file.name || `file-${idx}`} style={styles.jsonCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jsonName} numberOfLines={1}>{file.name || 'unknown.json'}</Text>
                <Text style={styles.jsonMeta}>{file.size || 0} bytes</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => handleDeleteJson(file.name || '')}>
                  <MaterialIcons name="delete-forever" size={24} color={Colors.delete} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Voice</Text>
      <SettingItem title="Speed" value={safeSpeed} onIncrease={() => updateSetting('speed', Math.min(1, safeSpeed + 0.1) as any)} onDecrease={() => updateSetting('speed', Math.max(0.1, safeSpeed - 0.1) as any)} unit="x" />
      <SettingItem title="Pitch" value={safePitch} onIncrease={() => updateSetting('pitch', Math.min(2, safePitch + 0.1) as any)} onDecrease={() => updateSetting('pitch', Math.max(0.5, safePitch - 0.1) as any)} />

      <Text style={styles.sectionTitle}>Delays</Text>
      <SettingItem title="Delay Question → Options" value={safeDelayQ} onIncrease={() => updateSetting('delayQuestionToOptions', (safeDelayQ + 0.1) as any)} onDecrease={() => updateSetting('delayQuestionToOptions', Math.max(0.1, safeDelayQ - 0.1) as any)} />
      <SettingItem title="Delay Between Options" value={safeDelayBetween} onIncrease={() => updateSetting('delayBetweenOptions', (safeDelayBetween + 0.1) as any)} onDecrease={() => updateSetting('delayBetweenOptions', Math.max(0.1, safeDelayBetween - 0.1) as any)} />
      <SettingItem title="Delay After Tick Answer" value={safeDelayTick} onIncrease={() => updateSetting('delayTickAnswer', (safeDelayTick + 0.1) as any)} onDecrease={() => updateSetting('delayTickAnswer', Math.max(0.1, safeDelayTick - 0.1) as any)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBase },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  sectionTitle: { color: Colors.highlight, fontSize: 13, fontWeight: '700', marginHorizontal: 16, marginTop: 20, marginBottom: 8, textTransform: 'uppercase' },
  urlCard: { backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14, marginHorizontal: 16, marginVertical: 6, borderWidth: 1, borderColor: Colors.border },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  urlLabel: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  urlInput: { backgroundColor: Colors.darkBase, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, color: '#FFF', fontSize: 11 },
  urlActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  previewBtn: { backgroundColor: Colors.highlight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewText: { color: Colors.darkBase, fontSize: 12, fontWeight: '700' },
  downloadBtn: { backgroundColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  downloadText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  previewResult: { fontSize: 11, marginTop: 8 },
  valid: { color: Colors.success },
  invalid: { color: Colors.delete },
  saveUrlsBtn: { backgroundColor: Colors.highlight, borderRadius: 12, padding: 14, marginHorizontal: 16, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveUrlsText: { color: Colors.darkBase, fontWeight: '700' },
  jsonCard: { backgroundColor: Colors.cardBg, borderRadius: 12, padding: 14, marginVertical: 6, marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  jsonName: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  jsonMeta: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  emptyText: { color: Colors.textMuted, fontSize: 12, marginHorizontal: 16, marginTop: 8 },
});
