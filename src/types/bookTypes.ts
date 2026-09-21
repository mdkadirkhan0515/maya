/**
 * Maya App - Book Types - Offline First
 * Learn: chapters -> lessons (english + bangla)
 * Guide: pages -> mcqs (question + 4 options + answer)
 * Custom: any JSON support
 */

export interface Lesson {
  serialNumber: string;
  englishText: string;
  bengaliMeaning: string;
}

export interface Chapter {
  chapterId: string;
  chapterTitle: string;
  lessons: Lesson[];
}

export interface EnglishLearningBook {
  bookTitle: string;
  chapters: Chapter[];
}

export interface MCQOption {
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface MCQ {
  serialNumber: string;
  questionText: string;
  options: MCQOption;
  answer: 'a' | 'b' | 'c' | 'd';
}

export interface Page {
  pageNumber: string;
  mcqs: MCQ[];
}

export interface GrammarMasterBook {
  bookTitle: string;
  pages: Page[];
}

export interface StoredJsonFile {
  name: string;
  url: string;
  data: any;
  downloadedAt: string;
  size: number;
}

export interface GithubUrls {
  learnUrl: string;
  guideUrl: string;
}

export type BookType = 'learn' | 'guide' | 'custom';
