export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  LEARNING = 'LEARNING',
  STATS = 'STATS'
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  category: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  difficulty?: Difficulty;
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  categoryScores: Record<string, number>;
  seenQuestions: string[];
  energy: number;
}

export enum GameState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ANSWERING = 'ANSWERING',
  REVIEWING = 'REVIEWING',
  ERROR = 'ERROR'
}

export interface SearchGroundingResult {
  url: string;
  title: string;
}

export const CATEGORIES = [
  { id: 'general', name: 'General Knowledge', icon: 'Lightbulb' },
  { id: 'science', name: 'Science', icon: 'Atom' },
  { id: 'history', name: 'History', icon: 'ScrollText' },
  { id: 'geography', name: 'Geography', icon: 'Globe' },
  { id: 'literature', name: 'Literature', icon: 'BookOpen' },
  { id: 'math', name: 'Math', icon: 'Calculator' },
  { id: 'tech', name: 'Technology', icon: 'Cpu' },
  { id: 'philippines', name: 'Philippines', icon: 'Sun' },
];