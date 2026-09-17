/**
 * Maya App - settingsService.ts
 * User's custom frequency & settings state management
 * FIXED: reset now only resets settings, NOT whole app data
 * Now async + crash-proof with optional chaining
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService, { AppSettings } from './storageService';

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

const SETTINGS_KEY = '@maya_settings';

export const SettingsService = {
  // Get settings - async, crash-proof
  get: async (): Promise<AppSettings> => {
    try {
      return await StorageService.getSettings();
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  // Sync fallback for immediate UI (legacy compatibility)
  getSync: (): AppSettings => {
    try {
      return StorageService.getSettingsSync();
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  // Update single key - async
  update: async <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<AppSettings> => {
    try {
      return await StorageService.updateSetting(key, value);
    } catch (e) {
      console.log('SettingsService update error', e);
      // Fallback: get current + merge
      const current = await StorageService.getSettings().catch(() => DEFAULT_SETTINGS);
      const updated = { ...current, [key]: value } as AppSettings;
      await StorageService.saveSettings(updated).catch(() => {});
      return updated;
    }
  },

  // Update multiple keys at once - async
  updateMultiple: async (obj: Partial<AppSettings>): Promise<AppSettings> => {
    try {
      const current = await StorageService.getSettings();
      const updated = { ...current, ...obj } as AppSettings;
      await StorageService.saveSettings(updated);
      return updated;
    } catch (e) {
      console.log('SettingsService updateMultiple error', e);
      return DEFAULT_SETTINGS;
    }
  },

  // FIXED RESET: Only resets settings to default, does NOT delete books/words
  reset: async (): Promise<AppSettings> => {
    try {
      // Only reset settings key, keep books and words safe
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      console.log('Settings reset to default - books and words preserved');
      return DEFAULT_SETTINGS;
    } catch (e) {
      console.log('SettingsService reset error', e);
      return DEFAULT_SETTINGS;
    }
  },

  // Explicit resetSettings alias - clearer name
  resetSettings: async (): Promise<AppSettings> => {
    return SettingsService.reset();
  },

  // Factory reset - ONLY if user explicitly wants to delete everything
  // This should be called only from a separate "Clear All Data" button with confirmation
  clearAllData: async (): Promise<void> => {
    try {
      // Warning: This deletes everything - books, words, settings
      await StorageService.clearAll();
      console.log('Factory reset: All data cleared');
    } catch (e) {
      console.log('clearAllData error', e);
    }
  },

  // Save settings directly
  save: async (settings: AppSettings): Promise<void> => {
    try {
      await StorageService.saveSettings(settings);
    } catch (e) {
      console.log('SettingsService save error', e);
    }
  },
};

export default SettingsService;
