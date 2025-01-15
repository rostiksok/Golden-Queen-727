import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface BalanceState {
  balance: number;
  setBalance: (newBalance: number) => void;
  incrementBalance: (amount: number) => void;
  decrementBalance: (amount: number) => void;
  bet: number;
  setBet: (newBet: number) => void;
  incrementBet: (amount: number) => void;
  decrementBet: (amount: number) => void;
  highScores: { [gameId: string]: number[] };
  addHighScore: (gameId: string, score: number | undefined) => void;
  resetBalance: () => void;
}

// Обгортка для AsyncStorage із серіалізацією
const asyncStorage: PersistStorage<BalanceState> = {
  getItem: async (name) => {
    const item = await AsyncStorage.getItem(name);
    return item ? JSON.parse(item) : null; // Десеріалізація
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value)); // Серіалізація
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

const useBalanceStore = create<BalanceState>()(
  persist(
    (set, get) => ({
      balance: 1000,
      setBalance: (newBalance) => set({ balance: newBalance }),
      incrementBalance: (amount) =>
        set((state) => ({ balance: state.balance + amount })),
      decrementBalance: (amount) => {
        const currentBalance = get().balance;
        const newBalance = currentBalance - amount;
        set({ balance: newBalance >= 0 ? newBalance : 0 });
      },
      bet: 50,
      setBet: (newBet) => {
        const currentBalance = get().balance;
        set({ bet: newBet > currentBalance ? currentBalance : newBet });
      },
      incrementBet: (amount) => {
        const { bet, balance } = get();
        const newBet = bet + amount;
        if (newBet <= balance) {
          set({ bet: newBet });
        }
      },
      decrementBet: (amount) => {
        const { bet } = get();
        const newBet = bet - amount;
        set({ bet: newBet >= 50 ? newBet : 50 });
      },
      highScores: {},
      addHighScore: (gameId: string, score: number | undefined) =>
        set((state: any) => {
          const currentScores = state.highScores[gameId] || [];
          return {
            highScores: {
              ...state.highScores,
              [gameId]: [...currentScores, score],
            },
          };
        }),
      resetBalance: () => {
        set({
          balance: 1000,
          bet: 50,
          highScores: {},
        });
      },
    }),
    {
      name: "balance-storage",
      storage: asyncStorage,
    }
  )
);

export default useBalanceStore;
