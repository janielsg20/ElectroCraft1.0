import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NativeRuntimeState = {
  authenticated: boolean;
  draftCount: number;
  setAuthenticated: (value: boolean) => void;
  incrementDraftCount: () => void;
};

export const RUNTIME_STATE_KEY = "electrocraft-m007-runtime";

export const useNativeRuntimeStore = create<NativeRuntimeState>()(
  persist(
    (set) => ({
      authenticated: false,
      draftCount: 0,
      setAuthenticated: (authenticated) => set({ authenticated }),
      incrementDraftCount: () => set((state) => ({ draftCount: state.draftCount + 1 })),
    }),
    {
      name: RUNTIME_STATE_KEY,
      storage: createJSONStorage(() => Storage),
      partialize: (state) => ({ authenticated: state.authenticated, draftCount: state.draftCount }),
      skipHydration: true,
    },
  ),
);
