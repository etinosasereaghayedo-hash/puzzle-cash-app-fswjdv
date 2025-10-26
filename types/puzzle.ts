
export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
  type: 'math' | 'word' | 'logic';
  question: string;
  answer: string;
  options?: string[];
  completed: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  totalEarnings: number;
  puzzlesSolved: number;
}
