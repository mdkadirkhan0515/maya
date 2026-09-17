/**
 * Maya App - Storage Service (AsyncStorage version)
 * Offline-first storage using @react-native-async-storage/async-storage
 * Stores: downloaded JSON, user vocabulary, app settings
 * Updated: saveJsonFile & deleteJsonFile now support ANY GitHub link + hardcoded UX
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  EnglishLearningBook,
  GrammarMasterBook,
  StoredJsonFile,
  GithubUrls,
} from '../types/bookTypes';

// ==================== TYPES ====================

export interface WordItem {
  id: string;
  text: string;
  createdAt: string; // ISO
  language?: 'en' | 'bn' | 'other';
}

export interface AppSettings {
  // TTS
  speed: number; // 0.1 - 1.0
  pitch: number; // 0.5 - 2.0
  language: 'en-US' | 'bn-BD';
  voiceId?: string;

  // Delays (seconds)
  delayQuestionToOptions: number;
  delayBetweenOptions: number;
  delayTickAnswer: number;

  // Theme
  theme: 'dark' | 'light';

  // GitHub URLs - NOT hardcoded in logic, but you CAN hardcode UX in this file if you want
  githubUrls: GithubUrls;

  // Auto-play
  autoPlayEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  speed: 0.5,
  pitch: 1.0,
  language: 'en-US',
  delayQuestionToOptions: 1.5,
  delayBetweenOptions: 0.8,
  delayTickAnswer: 1.0,
  theme: 'dark',
  githubUrls: {
    learnUrl: '',
    guideUrl: '',
  },
  autoPlayEnabled: false,
};

// ==================== HARDCODED UX CONFIG (Optional) ====================
// আপনি চাইলে এখানে হার্ডকোড GitHub লিংক বসাতে পারবেন
// যেকোনো লিংক বসালেও JSON ফরম্যাট ঠিক থাকলে কাজ করবে
// খালি রাখলে Settings থেকে user যা বসাবে সেটাই চলবে

export const HARDCODED_UX_URLS: GithubUrls & { extraUrls?: string[] } = {
  // এখানে আপনার GitHub Raw URL বসান - যেকোনো নাম, যেকোনো লিংক
  learnUrl: '', // e.g. 'https://raw.githubusercontent.com/user/repo/main/english_learning_book.json'
  guideUrl: '', // e.g. 'https://raw.githubusercontent.com/user/repo/main/grammar_master.json'
  extraUrls: [
    // চাইলে আরও JSON লিংক যোগ করুন
    // 'https://raw.githubusercontent.com/user/repo/main/custom_book.json',
  ],
};

// ==================== KEYS ====================

const KEYS = {
  WORDS: '@maya_words',
  SETTINGS: '@maya_settings',
  JSON_FILES: '@maya_json_files',
  LEARN_BOOK: '@maya_learn_book',
  GUIDE_BOOK: '@maya_guide_book',
  CUSTOM_BOOKS: '@maya_custom_books', // for any extra JSON
} as const;

// ==================== HELPER: Detect Book Type by JSON Structure ====================

const detectBookType = (data: any): 'learn' | 'guide' | 'custom' => {
  if (!data) return 'custom';
  if (Array.isArray(data?.chapters)) return 'learn';  // chapters থাকলে learn
  if (Array.isArray(data?.pages)) return 'guide';     // pages থাকলে guide
  return 'custom';                                    // অন্যথায় custom
};

// ==================== SERVICE ====================

export const StorageService = {
  // -------- Words - Words Tab (Tab 1) --------
  getWords: async (): Promise<WordItem[]> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.WORDS);
      if (!raw) return [];
      return JSON.parse(raw) as WordItem[];
    } catch {
      return [];
    }
  },

  saveWords: async (words: WordItem[]): Promise<void> => {
    await AsyncStorage.setItem(KEYS.WORDS, JSON.stringify(words));
  },

  addWord: async (text: string): Promise<WordItem[]> => {
    const words = await StorageService.getWords();
    const newWord: WordItem = {
      id: Date.now().toString(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newWord, ...words];
    await StorageService.saveWords(updated);
    return updated;
  },

  deleteWord: async (id: string): Promise<WordItem[]> => {
    const words = await StorageService.getWords();
    const filtered = words.filter(w => w.id !== id);
    await StorageService.saveWords(filtered);
    return filtered;
  },

  clearWords: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.WORDS);
  },

  // -------- Settings --------
  getSettings: async (): Promise<AppSettings> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (!raw) {
        // If hardcoded UX urls exist, merge them into default
        if (HARDCODED_UX_URLS.learnUrl || HARDCODED_UX_URLS.guideUrl) {
          return {
            ...DEFAULT_SETTINGS,
            githubUrls: {
              learnUrl: HARDCODED_UX_URLS.learnUrl || DEFAULT_SETTINGS.githubUrls.learnUrl,
              guideUrl: HARDCODED_UX_URLS.guideUrl || DEFAULT_SETTINGS.githubUrls.guideUrl,
            },
          };
        }
        return DEFAULT_SETTINGS;
      }
      const parsed = JSON.parse(raw) as AppSettings;
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed, 
        githubUrls: { ...DEFAULT_SETTINGS.githubUrls, ...parsed.githubUrls } 
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  // Sync version for immediate UI (fallback)
  getSettingsSync: (): AppSettings => DEFAULT_SETTINGS,

  saveSettings: async (settings: AppSettings): Promise<void> => {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  updateSetting: async <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<AppSettings> => {
    const current = await StorageService.getSettings();
    const updated = { ...current, [key]: value };
    await StorageService.saveSettings(updated);
    return updated;
  },

  updateGithubUrls: async (urls: Partial<GithubUrls>): Promise<AppSettings> => {
    const current = await StorageService.getSettings();
    const updated: AppSettings = {
      ...current,
      githubUrls: { ...current.githubUrls, ...urls },
    };
    await StorageService.saveSettings(updated);
    return updated;
  },

  // -------- JSON Files (GitHub) - UPDATED FOR ANY LINK + HARDCODED UX --------
  getJsonFiles: async (): Promise<StoredJsonFile[]> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.JSON_FILES);
      if (!raw) return [];
      return JSON.parse(raw) as StoredJsonFile[];
    } catch {
      return [];
    }
  },

  saveJsonFiles: async (files: StoredJsonFile[]): Promise<void> => {
    await AsyncStorage.setItem(KEYS.JSON_FILES, JSON.stringify(files));
  },

  getJsonFileByName: async (name: string): Promise<StoredJsonFile | undefined> => {
    const files = await StorageService.getJsonFiles();
    return files.find(f => f.name === name);
  },

  // UPDATED: saveJsonFile now supports ANY GitHub link, ANY file name, JSON format stays correct
  saveJsonFile: async (file: StoredJsonFile): Promise<StoredJsonFile[]> => {
    try {
      if (!file || !file?.data) {
        console.log('saveJsonFile: invalid file', file);
        return await StorageService.getJsonFiles();
      }

      const existing = await StorageService.getJsonFiles();
      // Remove same name or same url to avoid duplicates - supports any link
      const withoutSame = existing.filter(f => f?.name !== file?.name && f?.url !== file?.url);
      const updated = [file, ...withoutSame];
      await StorageService.saveJsonFiles(updated);

      // Detect book type by JSON structure, NOT by file name - supports any GitHub link
      const bookType = detectBookType(file.data);
      console.log(`saveJsonFile: ${file.name} detected as ${bookType} by structure`);

      if (bookType === 'learn') {
        // Learn book: has chapters
        await AsyncStorage.setItem(KEYS.LEARN_BOOK, JSON.stringify(file.data));
      } else if (bookType === 'guide') {
        // Guide book: has pages
        await AsyncStorage.setItem(KEYS.GUIDE_BOOK, JSON.stringify(file.data));
      } else {
        // Custom book: save to custom list + also try to save as both for compatibility
        const customRaw = await AsyncStorage.getItem(KEYS.CUSTOM_BOOKS);
        let customBooks: StoredJsonFile[] = [];
        try {
          customBooks = customRaw ? JSON.parse(customRaw) : [];
        } catch {
          customBooks = [];
        }
        const filteredCustom = customBooks.filter(f => f?.name !== file?.name && f?.url !== file?.url);
        await AsyncStorage.setItem(KEYS.CUSTOM_BOOKS, JSON.stringify([file, ...filteredCustom]));

        // Fallback: if JSON has both chapters and pages? try best guess by name/url for hardcoded UX
        const lowerName = (file?.name + file?.url)?.toLowerCase() || '';
        if (lowerName.includes('english') || lowerName.includes('learn') || lowerName.includes('lesson')) {
          await AsyncStorage.setItem(KEYS.LEARN_BOOK, JSON.stringify(file.data));
        } else if (lowerName.includes('grammar') || lowerName.includes('guide') || lowerName.includes('mcq')) {
          await AsyncStorage.setItem(KEYS.GUIDE_BOOK, JSON.stringify(file.data));
        }
      }

      return updated;
    } catch (e) {
      console.log('saveJsonFile error', e);
      return await StorageService.getJsonFiles().catch(() => []);
    }
  },

  // SAFETY: deleteJsonFile - crash-proof with optional chaining & early return
  deleteJsonFile: async (name: string): Promise<StoredJsonFile[]> => {
    try {
      if (!name) return await StorageService.getJsonFiles();

      const existing = await StorageService.getJsonFiles();
      const fileToDelete = existing.find(f => f?.name === name || f?.url === name);
      
      if (!fileToDelete) return existing; // ফাইল না থাকলে রিটার্ন করে দেব - crash হবে না

      const bookType = detectBookType(fileToDelete?.data);
      const filtered = existing.filter(f => f?.name !== name && f?.url !== name);
      await StorageService.saveJsonFiles(filtered);

      if (bookType === 'learn') {
        await AsyncStorage.removeItem(KEYS.LEARN_BOOK);
      } else if (bookType === 'guide') {
        await AsyncStorage.removeItem(KEYS.GUIDE_BOOK);
      } else {
        // Custom book হলে custom list থেকেও ডিলিট + learn/guide hint clean
        const customRaw = await AsyncStorage.getItem(KEYS.CUSTOM_BOOKS);
        if (customRaw) {
          try {
            const customBooks: StoredJsonFile[] = JSON.parse(customRaw);
            const filteredCustom = customBooks.filter(f => f?.name !== name && f?.url !== name);
            await AsyncStorage.setItem(KEYS.CUSTOM_BOOKS, JSON.stringify(filteredCustom));
          } catch {}
        }
        const lowerName = (fileToDelete?.name + fileToDelete?.url)?.toLowerCase() || '';
        if (lowerName.includes('english') || lowerName.includes('learn')) {
          await AsyncStorage.removeItem(KEYS.LEARN_BOOK);
        }
        if (lowerName.includes('grammar') || lowerName.includes('guide')) {
          await AsyncStorage.removeItem(KEYS.GUIDE_BOOK);
        }
      }
      
      return filtered;
    } catch (e) {
      console.log('deleteJsonFile error', e);
      return await StorageService.getJsonFiles().catch(() => []);
    }
  },

  // Quick access for Learn & Guide - now crash-proof
  getLearnBook: async (): Promise<EnglishLearningBook | null> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.LEARN_BOOK);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Validate structure
      if (parsed && Array.isArray(parsed.chapters)) {
        return parsed as EnglishLearningBook;
      }
      return null;
    } catch {
      return null;
    }
  },

  getGuideBook: async (): Promise<GrammarMasterBook | null> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.GUIDE_BOOK);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.pages)) {
        return parsed as GrammarMasterBook;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Get all custom books (for any GitHub link)
  getCustomBooks: async (): Promise<StoredJsonFile[]> => {
    try {
      const raw = await AsyncStorage.getItem(KEYS.CUSTOM_BOOKS);
      if (!raw) return [];
      return JSON.parse(raw) as StoredJsonFile[];
    } catch {
      return [];
    }
  },

  // -------- Utils --------
  clearAll: async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      KEYS.WORDS,
      KEYS.SETTINGS,
      KEYS.JSON_FILES,
      KEYS.LEARN_BOOK,
      KEYS.GUIDE_BOOK,
      KEYS.CUSTOM_BOOKS,
    ]);
  },

  getStorageSize: async (): Promise<{ words: number; jsonFiles: number; settings: number }> => {
    const words = await StorageService.getWords();
    const jsonFiles = await StorageService.getJsonFiles();
    return {
      words: words.length,
      jsonFiles: jsonFiles.length,
      settings: 1,
    };
  },
};

export default StorageService;
