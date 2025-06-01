import { createStore } from "zustand/vanilla";

type FiveArr<T> = [T, T, T, T, T];
interface DraftState {
  currentStep: number;
  selectedChampion: string | null;
  bans: [FiveArr<string | null>, FiveArr<string | null>];
  picks: [FiveArr<string | null>, FiveArr<string | null>];
}

export const defaultInitState: DraftState = {
  currentStep: 0,
  selectedChampion: null,
  bans: [
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  picks: [
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
};

export const createCounterStore = (initState: CounterState = defaultInitState) => {
  return createStore<CounterStore>()((set) => ({
    ...initState,
    decrementCount: () => set((state) => ({ count: state.count - 1 })),
    incrementCount: () => set((state) => ({ count: state.count + 1 })),
  }));
};
