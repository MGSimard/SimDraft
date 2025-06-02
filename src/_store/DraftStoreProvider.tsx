import { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { type DraftStore, createDraftStore, initialState } from "@/_store/draftStore";

export type DraftStoreApi = ReturnType<typeof createDraftStore>;

export const DraftStoreContext = createContext<DraftStoreApi | undefined>(undefined);

export interface DraftStoreProviderProps {
  children: React.ReactNode;
}

export const DraftStoreProvider = ({ children }: DraftStoreProviderProps) => {
  const storeRef = useRef<DraftStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createDraftStore(initialState);
  }

  return <DraftStoreContext.Provider value={storeRef.current}>{children}</DraftStoreContext.Provider>;
};

export const useDraftStore = <T,>(selector: (store: DraftStore) => T): T => {
  const draftStoreContext = useContext(DraftStoreContext);

  if (!draftStoreContext) {
    throw new Error(`useDraftStore must be used within DraftStoreProvider`);
  }

  return useStore(draftStoreContext, selector);
};
