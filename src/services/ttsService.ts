/**
 * Maya App - TTS Service - FIXED CRASH-PROOF VERSION (SDK 57)
 * Problem: export const TTSService = { speak(){ TTSService.init() } } causes TDZ crash
 * Fix: Define standalone functions first, then export object - NO self-reference inside
 * Uses expo-speech + auto Bengali detection
 */

import * as Speech from 'expo-speech';
import type { MCQ } from '../types/bookTypes';
import type { AppSettings } from './storageService';

// ==================== TYPES ====================

export interface TTSOptions {
  speed?: number;   // 0.1 - 1.0
  pitch?: number;   // 0.5 - 2.0
  language?: 'en-US' | 'bn-BD';
  voiceId?: string;
}

export interface SpeakResult {
  success: boolean;
  error?: string;
}

// ==================== STATE ====================

let isInitialized = false;
let availableVoices: Speech.Voice[] = [];

// ==================== LANGUAGE DETECTION ====================

export const isBengali = (text: string): boolean => {
  if (!text) return false;
  return /[\u0980-\u09FF]/.test(text);
};

export const detectLanguage = (text: string): 'en-US' | 'bn-BD' => {
  return isBengali(text) ? 'bn-BD' : 'en-US';
};

const hasOnlyEnglish = (lesson: { englishText?: string; bengaliMeaning?: string }): boolean => {
  return !!lesson?.englishText?.trim() && !lesson?.bengaliMeaning?.trim();
};

const hasOnlyBengali = (lesson: { englishText?: string; bengaliMeaning?: string }): boolean => {
  return !lesson?.englishText?.trim() && !!lesson?.bengaliMeaning?.trim();
};

// ==================== CORE FUNCTIONS (NO SELF REFERENCE) ====================

async function init(): Promise<Speech.Voice[]> {
  if (isInitialized) return availableVoices;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    availableVoices = voices || [];
    isInitialized = true;
    console.log(`Expo Speech: ${availableVoices.length} voices`);
    return availableVoices;
  } catch (e) {
    console.log('Expo Speech init error', e);
    isInitialized = true;
    return [];
  }
}

function getVoicesByLanguage(lang: 'en-US' | 'bn-BD'): Speech.Voice[] {
  return availableVoices.filter(v => 
    v.language === lang || v.language?.startsWith(lang.split('-')[0])
  );
}

async function speak(text: string, options: TTSOptions = {}): Promise<SpeakResult> {
  if (!text || !text.trim()) {
    return { success: false, error: 'Empty text' };
  }
  try {
    await init(); // FIXED: direct call, not TTSService.init()

    const speed = options.speed ?? 0.5;
    const pitch = options.pitch ?? 1.0;
    const lang = options.language ?? 'en-US';

    try { await Speech.stop(); } catch {}

    const rate = Math.max(0.5, Math.min(2.0, speed * 2));

    const speakOptions: Speech.SpeechOptions = {
      language: lang,
      pitch: pitch,
      rate: rate,
      voice: options.voiceId,
    };

    if (options.voiceId) {
      const voice = availableVoices.find(v => v.identifier === options.voiceId);
      if (voice) speakOptions.voice = voice.identifier;
    }

    await Speech.speak(text.trim(), speakOptions);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

async function stop(): Promise<void> {
  try { await Speech.stop(); } catch {}
}

function delay(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// ==================== AUTO UX ====================

async function speakWordAuto(text: string, settings: AppSettings): Promise<SpeakResult> {
  if (!text?.trim()) return { success: false, error: 'Empty' };
  const lang = detectLanguage(text);
  return speak(text, {
    speed: settings?.speed ?? 0.5,
    pitch: settings?.pitch ?? 1.0,
    language: lang,
    voiceId: settings?.voiceId,
  });
}

async function speakLearnAuto(
  lesson: { englishText?: string; bengaliMeaning?: string },
  settings: AppSettings
): Promise<SpeakResult> {
  try {
    const en = lesson?.englishText?.trim() || '';
    const bn = lesson?.bengaliMeaning?.trim() || '';
    if (!en && !bn) return { success: false, error: 'No text' };

    if (hasOnlyEnglish(lesson)) {
      return await speak(en, { speed: settings?.speed ?? 0.5, pitch: settings?.pitch ?? 1.0, language: 'en-US', voiceId: settings?.voiceId });
    }
    if (hasOnlyBengali(lesson)) {
      return await speak(bn, { speed: settings?.speed ?? 0.5, pitch: settings?.pitch ?? 1.0, language: 'bn-BD', voiceId: settings?.voiceId });
    }

    const delayBetween = settings?.delayBetweenOptions ?? 0.8;
    await speak(en, { speed: settings?.speed ?? 0.5, pitch: settings?.pitch ?? 1.0, language: 'en-US', voiceId: settings?.voiceId });
    const enDuration = (en.length * 0.06) / (settings?.speed || 0.5);
    await delay(enDuration + delayBetween);
    return await speak(bn, { speed: settings?.speed ?? 0.5, pitch: settings?.pitch ?? 1.0, language: 'bn-BD', voiceId: settings?.voiceId });
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

async function speakGuideAuto(
  mcq: MCQ,
  settings: AppSettings,
  mode: 'question+options' | 'question+answer' = 'question+options'
): Promise<SpeakResult> {
  try {
    if (!mcq) return { success: false, error: 'No MCQ' };
    const question = mcq?.questionText?.trim() || '';
    const opts = mcq?.options;
    if (!opts) return { success: false, error: 'No options' };

    let fullText = '';
    if (mode === 'question+options') {
      fullText = `${question}. Option A ${opts?.a || ''}, Option B ${opts?.b || ''}, Option C ${opts?.c || ''}, Option D ${opts?.d || ''}`;
    } else {
      const answerKey = mcq?.answer || 'a';
      const answerText = (opts as any)[answerKey] || '';
      fullText = `${question}. Answer is Option ${answerKey?.toUpperCase()} ${answerText}`;
    }

    return await speak(fullText, {
      speed: settings?.speed ?? 0.5,
      pitch: settings?.pitch ?? 1.0,
      language: 'en-US',
      voiceId: settings?.voiceId,
    });
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

async function speakLearnSequenceAuto(
  lessons: { englishText?: string; bengaliMeaning?: string }[],
  startIndex: number,
  settings: AppSettings,
  onProgress?: (index: number) => void,
  shouldContinue?: () => boolean
): Promise<void> {
  for (let i = startIndex; i < (lessons?.length || 0); i++) {
    if (shouldContinue && !shouldContinue()) break;
    const lesson = lessons[i];
    if (!lesson) continue;
    onProgress?.(i);
    await speakLearnAuto(lesson, settings);
    const totalLen = (lesson?.englishText?.length || 0) + (lesson?.bengaliMeaning?.length || 0);
    const estimatedDuration = (totalLen * 0.06) / (settings?.speed || 0.5);
    await delay(estimatedDuration + (settings?.delayBetweenOptions || 0.8) + 0.5);
  }
}

async function speakGuideSequenceAuto(
  mcqs: MCQ[],
  startIndex: number,
  settings: AppSettings,
  mode: 'question+options' | 'question+answer' = 'question+options',
  onProgress?: (index: number) => void,
  shouldContinue?: () => boolean
): Promise<void> {
  for (let i = startIndex; i < (mcqs?.length || 0); i++) {
    if (shouldContinue && !shouldContinue()) break;
    const mcq = mcqs[i];
    if (!mcq) continue;
    onProgress?.(i);
    await speakGuideAuto(mcq, settings, mode);
    const textLength = (mcq?.questionText?.length || 0) + Object.values(mcq?.options || {}).join(' ').length;
    const estimatedDuration = (textLength * 0.06) / (settings?.speed || 0.5);
    const delayExtra = mode === 'question+options' ? (settings?.delayQuestionToOptions || 1.5) : (settings?.delayTickAnswer || 1.0);
    await delay(estimatedDuration + delayExtra + (settings?.delayBetweenOptions || 0.8));
  }
}

// ==================== LEGACY COMPAT ====================

async function speakWord(text: string, settings: AppSettings): Promise<SpeakResult> {
  const lang = text ? detectLanguage(text) : (settings?.language || 'en-US');
  return speak(text, { speed: settings?.speed, pitch: settings?.pitch, language: lang, voiceId: settings?.voiceId });
}

async function speakLearnCard(
  lesson: { englishText: string; bengaliMeaning: string },
  mode: 0 | 1 | 2 | 3,
  settings: AppSettings
): Promise<SpeakResult> {
  if (mode === 1 || mode === 3) {
    return speak(lesson?.englishText || '', { speed: settings?.speed, pitch: settings?.pitch, language: 'en-US', voiceId: settings?.voiceId });
  } else {
    return speakLearnAuto(lesson, settings);
  }
}

async function speakGuideCard(
  mcq: MCQ,
  mode: 0 | 1 | 2 | 3,
  settings: AppSettings
): Promise<SpeakResult> {
  const m = (mode === 1 || mode === 3) ? 'question+answer' : 'question+options';
  return speakGuideAuto(mcq, settings, m as any);
}

async function speakLearnSequence(
  lessons: { englishText: string; bengaliMeaning: string }[],
  startIndex: number,
  mode: 2 | 3,
  settings: AppSettings,
  onProgress?: (index: number) => void,
  shouldContinue?: () => boolean
): Promise<void> {
  return speakLearnSequenceAuto(lessons, startIndex, settings, onProgress, shouldContinue);
}

async function speakGuideSequence(
  mcqs: MCQ[],
  startIndex: number,
  mode: 2 | 3,
  settings: AppSettings,
  onProgress?: (index: number) => void,
  shouldContinue?: () => boolean
): Promise<void> {
  const m = mode === 3 ? 'question+answer' : 'question+options';
  return speakGuideSequenceAuto(mcqs, startIndex, settings, m as any, onProgress, shouldContinue);
}

async function isSpeaking(): Promise<boolean> {
  try { return await Speech.isSpeakingAsync(); } catch { return false; }
}

// ==================== EXPORT (NO SELF REFERENCE) ====================

export const TTSService = {
  init,
  getVoicesByLanguage,
  speak,
  stop,
  delay,
  speakWordAuto,
  speakLearnAuto,
  speakGuideAuto,
  speakLearnSequenceAuto,
  speakGuideSequenceAuto,
  speakWord,
  speakLearnCard,
  speakGuideCard,
  speakLearnSequence,
  speakGuideSequence,
  isSpeaking,
};

export default TTSService;
