import { create } from "zustand";

interface HighScoreEntry {
  difficulty: "Easy" | "Medium" | "Hard";
  isWin: boolean;
  score: number;
  date: string;
}

interface ComplexHighScoreState {
  complexHighScores: {
    [gameId: string]: HighScoreEntry[];
  };
  totalWins: number;
  totalAttempts: number;
  addHighScore: (
    gameId: string,
    difficulty: HighScoreEntry["difficulty"],
    isWin: boolean,
    score: number
  ) => void;
  resetHighScores: () => void;
  incrementTotalWins: () => void;
  incrementTotalAttempts: () => void;
}

const useComplexHighScoreStore = create<ComplexHighScoreState>((set) => ({
  complexHighScores: {},
  totalWins: 0,
  totalAttempts: 0,
  addHighScore: (gameId, difficulty, isWin, score) =>
    set((state) => {
      const currentList = state.complexHighScores[gameId] || [];
      return {
        complexHighScores: {
          ...state.complexHighScores,
          [gameId]: [
            ...currentList,
            { difficulty, isWin, score, date: new Date().toISOString() },
          ],
        },
      };
    }),
  resetHighScores: () =>
    set(() => ({
      complexHighScores: {},
      totalWins: 0,
      totalAttempts: 0,
    })),
  incrementTotalWins: () =>
    set((state) => ({ totalWins: state.totalWins + 1 })),
  incrementTotalAttempts: () =>
    set((state) => ({ totalAttempts: state.totalAttempts + 1 })),
}));

export default useComplexHighScoreStore;
