
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Puzzle, UserProfile } from '@/types/puzzle';
import { puzzles as initialPuzzles } from '@/data/puzzles';

interface PuzzleContextType {
  puzzles: Puzzle[];
  userProfile: UserProfile;
  solvePuzzle: (puzzleId: string) => void;
  resetProgress: () => void;
}

const PuzzleContext = createContext<PuzzleContextType | undefined>(undefined);

export const PuzzleProvider = ({ children }: { children: ReactNode }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>(initialPuzzles);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Puzzle Solver',
    email: 'solver@puzzleapp.com',
    totalEarnings: 0,
    puzzlesSolved: 0,
  });

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
      puzzlesSolved: prev.puzzlesSolved + 1,
    }));
  };

  const resetProgress = () => {
    console.log('Resetting progress');
    setPuzzles(initialPuzzles);
    setUserProfile({
      name: 'Puzzle Solver',
      email: 'solver@puzzleapp.com',
      totalEarnings: 0,
      puzzlesSolved: 0,
    });
  };

  return (
    <PuzzleContext.Provider value={{ puzzles, userProfile, solvePuzzle, resetProgress }}>
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
