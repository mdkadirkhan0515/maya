/**
 * Maya App - GitHub Service (Custom Book Support Added)
 * Fetch master JSON files from ANY GitHub Raw URL
 * URLs are NOT hardcoded - taken from Settings input + HARDCODED_UX_URLS
 * Now supports custom JSON - learn, guide, custom
 */

import type {
  EnglishLearningBook,
  GrammarMasterBook,
  StoredJsonFile,
} from '../types/bookTypes';

export interface FetchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  url: string;
  status?: number;
}

export interface PreviewResult {
  bookTitle: string;
  count: number; // chapters or pages or items
  type: 'learn' | 'guide' | 'custom'; // 'custom' যুক্ত করা হলো - যেকোনো JSON সাপোর্ট
  valid: boolean;
}

const FETCH_TIMEOUT = 15000; // 15 sec

// Helper: timeout fetch - crash-proof with optional chaining
const fetchWithTimeout = async (url: string, timeout = FETCH_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

// Validate Learn JSON structure - safety with optional chaining
const isValidLearnBook = (data: any): data is EnglishLearningBook => {
  return (
    data &&
    typeof data?.bookTitle === 'string' &&
    Array.isArray(data?.chapters) &&
    data?.chapters?.every((ch: any) => 
      typeof ch?.chapterId === 'string' &&
      typeof ch?.chapterTitle === 'string' &&
      Array.isArray(ch?.lessons)
    )
  );
};

// Validate Guide JSON structure - safety with optional chaining
const isValidGuideBook = (data: any): data is GrammarMasterBook => {
  return (
    data &&
    typeof data?.bookTitle === 'string' &&
    Array.isArray(data?.pages) &&
    data?.pages?.every((p: any) =>
      typeof p?.pageNumber === 'string' &&
      Array.isArray(p?.mcqs)
    )
  );
};

// Validate Custom - any valid JSON object
const isValidCustomBook = (data: any): boolean => {
  if (!data) return false;
  if (typeof data !== 'object') return false;
  // At least has some content
  return Object.keys(data).length > 0;
};

export const GithubService = {
  /**
   * Generic fetch from any GitHub Raw URL - supports ANY link
   */
  async fetchJsonFromUrl<T>(url: string): Promise<FetchResult<T>> {
    if (!url || !url?.trim()) {
      return { success: false, error: 'URL is empty', url };
    }

    // Allow any https URL for custom books, not just raw.githubusercontent.com
    if (!url.includes('raw.githubusercontent.com') && !url.startsWith('https://')) {
      return { success: false, error: 'Invalid URL. Must be https:// URL', url };
    }

    try {
      const response = await fetchWithTimeout(url);

      if (!response?.ok) {
        return {
          success: false,
          error: `HTTP ${response?.status}: ${response?.statusText}`,
          url,
          status: response?.status,
        };
      }

      const data = (await response.json()) as T;

      return { success: true, data, url, status: response?.status };
    } catch (error: any) {
      const msg = error?.name === 'AbortError' ? 'Request timeout (15s)' : error?.message || 'Network error';
      return { success: false, error: msg, url };
    }
  },

  /**
   * Fetch Learn Book - english_learning_book.json
   */
  async fetchLearnBook(url: string): Promise<FetchResult<EnglishLearningBook>> {
    const result = await GithubService.fetchJsonFromUrl<EnglishLearningBook>(url);

    if (!result?.success || !result?.data) {
      return result as FetchResult<EnglishLearningBook>;
    }

    if (!isValidLearnBook(result?.data)) {
      return {
        success: false,
        error: 'Invalid Learn Book format. Expected { bookTitle, chapters: [{ chapterId, chapterTitle, lessons: [{ serialNumber, englishText, bengaliMeaning }] }] }',
        url,
      };
    }

    return result;
  },

  /**
   * Fetch Guide Book - grammar_master.json
   */
  async fetchGuideBook(url: string): Promise<FetchResult<GrammarMasterBook>> {
    const result = await GithubService.fetchJsonFromUrl<GrammarMasterBook>(url);

    if (!result?.success || !result?.data) {
      return result as FetchResult<GrammarMasterBook>;
    }

    if (!isValidGuideBook(result?.data)) {
      return {
        success: false,
        error: 'Invalid Guide Book format. Expected { bookTitle, pages: [{ pageNumber, mcqs: [{ serialNumber, questionText, options: {a,b,c,d}, answer }] }] }',
        url,
      };
    }

    return result;
  },

  /**
   * Preview without saving - for Settings UX
   * Supports learn, guide, AND custom JSON
   */
  async previewUrl(url: string): Promise<PreviewResult & { error?: string }> {
    try {
      if (!url?.trim()) {
        return { bookTitle: '', count: 0, type: 'custom', valid: false, error: 'URL empty' };
      }

      const response = await fetchWithTimeout(url);
      if (!response?.ok) {
        return { bookTitle: '', count: 0, type: 'custom', valid: false, error: `HTTP ${response?.status}` };
      }

      const data = await response.json();

      if (isValidLearnBook(data)) {
        return {
          bookTitle: data?.bookTitle || 'English Learning Book',
          count: data?.chapters?.length || 0,
          type: 'learn',
          valid: true,
        };
      }

      if (isValidGuideBook(data)) {
        return {
          bookTitle: data?.bookTitle || 'Grammar Master',
          count: data?.pages?.length || 0,
          type: 'guide',
          valid: true,
        };
      }

      // যদি Learn বা Guide না হয়, তবুও যদি valid JSON হয় এবং তাতে bookTitle বা অবজেক্ট থাকে - custom হিসেবে valid ধরবে
      if (isValidCustomBook(data)) {
        return {
          bookTitle: data?.bookTitle || data?.title || data?.name || 'Custom Book',
          count: Array.isArray(data?.items) ? data.items.length : 
                 Array.isArray(data?.data) ? data.data.length :
                 Array.isArray(data?.chapters) ? data.chapters.length :
                 Array.isArray(data?.pages) ? data.pages.length :
                 Object.keys(data || {}).length,
          type: 'custom',
          valid: true, // কাস্টম হলেও ভ্যালিড ধরবে - যেকোনো JSON সাপোর্ট
        };
      }

      return { bookTitle: '', count: 0, type: 'custom', valid: false, error: 'Invalid JSON structure - empty or not an object' };
    } catch (e: any) {
      return { bookTitle: '', count: 0, type: 'custom', valid: false, error: e?.message || 'Preview failed' };
    }
  },

  /**
   * Download and prepare for storage - supports any link, any format
   */
  async downloadAsStoredFile(url: string): Promise<FetchResult<StoredJsonFile>> {
    const preview = await GithubService.previewUrl(url);

    if (!preview?.valid) {
      return { success: false, error: preview?.error || 'Invalid file', url };
    }

    const fetchResult = await GithubService.fetchJsonFromUrl<any>(url);

    if (!fetchResult?.success || !fetchResult?.data) {
      return { success: false, error: fetchResult?.error, url };
    }

    // File name from URL - supports any name
    const rawName = url.split('/').pop()?.split('?')[0] || '';
    const fileName = rawName || 
      (preview?.type === 'learn' ? 'english_learning_book.json' : 
       preview?.type === 'guide' ? 'grammar_master.json' : 
       'custom_book.json');

    const storedFile: StoredJsonFile = {
      name: fileName,
      url,
      data: fetchResult?.data,
      downloadedAt: new Date().toISOString(),
      size: JSON.stringify(fetchResult?.data || {}).length,
    };

    return { success: true, data: storedFile, url };
  },

  /**
   * Get file name from URL - crash-proof
   */
  getFileNameFromUrl(url: string): string {
    try {
      return url?.split('/').pop()?.split('?')[0] || 'unknown.json';
    } catch {
      return 'unknown.json';
    }
  },
};

export default GithubService;
