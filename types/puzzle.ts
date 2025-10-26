
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
  availableBalance: number;
  totalWithdrawn: number;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  method: 'paypal' | 'stripe' | 'bank';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  email?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'paypal' | 'stripe' | 'bank';
  label: string;
  email?: string;
  accountNumber?: string;
}
