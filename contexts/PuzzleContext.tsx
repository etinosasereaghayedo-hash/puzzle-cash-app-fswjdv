
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Puzzle, UserProfile, PayoutRequest, PaymentMethod } from '@/types/puzzle';
import { puzzles as initialPuzzles } from '@/data/puzzles';

interface PuzzleContextType {
  puzzles: Puzzle[];
  userProfile: UserProfile;
  payoutRequests: PayoutRequest[];
  paymentMethods: PaymentMethod[];
  solvePuzzle: (puzzleId: string) => void;
  resetProgress: () => void;
  requestPayout: (amount: number, methodId: string) => Promise<boolean>;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (methodId: string) => void;
}

const PuzzleContext = createContext<PuzzleContextType | undefined>(undefined);

export const PuzzleProvider = ({ children }: { children: ReactNode }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>(initialPuzzles);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Puzzle Solver',
    email: 'solver@puzzleapp.com',
    totalEarnings: 0,
    puzzlesSolved: 0,
    availableBalance: 0,
    totalWithdrawn: 0,
  });
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'paypal',
      label: 'PayPal',
      email: 'solver@puzzleapp.com',
    },
  ]);

  const solvePuzzle = (puzzleId: string) => {
    console.log('Solving puzzle:', puzzleId);
    setPuzzles((prevPuzzles) =>
      prevPuzzles.map((puzzle) =>
        puzzle.id === puzzleId ? { ...puzzle, completed: true } : puzzle
      )
    );
    setUserProfile((prev) => ({
      ...prev,
      totalEarnings: prev.totalEarnings + 10,
      availableBalance: prev.availableBalance + 10,
      puzzlesSolved: prev.puzzlesSolved + 1,
    }));
  };

  const requestPayout = async (amount: number, methodId: string): Promise<boolean> => {
    console.log('Requesting payout:', amount, methodId);
    
    if (amount > userProfile.availableBalance) {
      console.log('Insufficient balance');
      return false;
    }

    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) {
      console.log('Payment method not found');
      return false;
    }

    const newPayout: PayoutRequest = {
      id: Date.now().toString(),
      amount,
      method: method.type,
      status: 'pending',
      requestedAt: new Date(),
      email: method.email,
    };

    setPayoutRequests((prev) => [newPayout, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      totalWithdrawn: prev.totalWithdrawn + amount,
    }));

    // Simulate processing
    setTimeout(() => {
      setPayoutRequests((prev) =>
        prev.map((req) =>
          req.id === newPayout.id
            ? { ...req, status: 'processing' }
            : req
        )
      );
    }, 2000);

    // Simulate completion
    setTimeout(() => {
      setPayoutRequests((prev) =>
        prev.map((req) =>
          req.id === newPayout.id
            ? { ...req, status: 'completed', completedAt: new Date() }
            : req
        )
      );
    }, 5000);

    return true;
  };

  const addPaymentMethod = (method: PaymentMethod) => {
    console.log('Adding payment method:', method);
    setPaymentMethods((prev) => [...prev, method]);
  };

  const removePaymentMethod = (methodId: string) => {
    console.log('Removing payment method:', methodId);
    setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId));
  };

  const resetProgress = () => {
    console.log('Resetting progress');
    setPuzzles(initialPuzzles);
    setUserProfile({
      name: 'Puzzle Solver',
      email: 'solver@puzzleapp.com',
      totalEarnings: 0,
      puzzlesSolved: 0,
      availableBalance: 0,
      totalWithdrawn: 0,
    });
    setPayoutRequests([]);
  };

  return (
    <PuzzleContext.Provider
      value={{
        puzzles,
        userProfile,
        payoutRequests,
        paymentMethods,
        solvePuzzle,
        resetProgress,
        requestPayout,
        addPaymentMethod,
        removePaymentMethod,
      }}
    >
      {children}
    </PuzzleContext.Provider>
  );
};

export const usePuzzles = () => {
  const context = useContext(PuzzleContext);
  if (context === undefined) {
    throw new Error('usePuzzles must be used within a PuzzleProvider');
  }
  return context;
};
