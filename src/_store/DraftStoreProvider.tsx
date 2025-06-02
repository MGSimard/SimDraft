import { createContext, useRef, useContext, type ReactNode } from "react";
import { useStore } from "zustand";
import { createDraftStore, initialState } from "@/_store/draftStore";
import type { DraftStore } from "@/_store/types";

export type DraftStoreApi = ReturnType<typeof createDraftStore>;

export const DraftStoreContext = createContext<DraftStoreApi | undefined>(undefined);

export interface DraftStoreProviderProps {
  children: ReactNode;
  initialData?: typeof initialState;
}

/**
 * DraftStoreProvider creates a new store instance per component mount.
 * This ensures proper SSR behavior where each request gets its own store
 * instance, preventing shared state between different users/requests.
 */
export const DraftStoreProvider = ({ children, initialData }: DraftStoreProviderProps) => {
  const storeRef = useRef<DraftStoreApi | null>(null);

  // Create store only once per component instance (important for SSR)
  if (storeRef.current === null) {
    storeRef.current = createDraftStore(initialData ?? initialState);
  }

  return <DraftStoreContext.Provider value={storeRef.current}>{children}</DraftStoreContext.Provider>;
};

export const useDraftStore = <T,>(selector: (store: DraftStore) => T): T => {
  const draftStoreContext = useContext(DraftStoreContext);

  if (!draftStoreContext) {
    throw new Error("ERROR: useDraftStore must be used within DraftStoreProvider.");
  }

  return useStore(draftStoreContext, selector);
};
