'use client';
import { useEffect, useSyncExternalStore } from 'react';

type Store = {
  hasSetPreference: boolean;
  allowNonFunctionalCookies: boolean;
  setCookiesPref: (allowNonFunctionalCookies: boolean) => void;
  // Internal state to track if the store has hydrated from storage
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

const STORAGE_KEY = 'cookies-consent';
const listeners = new Set<() => void>();
let didHydrate = false;

const setCookiesPref = (allowNonFunctionalCookies: boolean) => {
  setState({
    hasSetPreference: true,
    allowNonFunctionalCookies,
  });
};

const setHasHydrated = (state: boolean) => {
  setState({
    hasHydrated: state,
  });
};

let storeState: Store = {
  hasSetPreference: false,
  allowNonFunctionalCookies: false,
  hasHydrated: false,
  setCookiesPref,
  setHasHydrated,
};

function persistState() {
  if (typeof window === 'undefined') return;
  const serializable = {
    hasSetPreference: storeState.hasSetPreference,
    allowNonFunctionalCookies: storeState.allowNonFunctionalCookies,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

function setState(patch: Partial<Store>) {
  storeState = { ...storeState, ...patch };
  if ('hasSetPreference' in patch || 'allowNonFunctionalCookies' in patch) {
    persistState();
  }
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function hydrateFromStorage() {
  if (didHydrate || typeof window === 'undefined') return;
  didHydrate = true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    setHasHydrated(true);
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    setState({
      hasSetPreference: Boolean(parsed.hasSetPreference),
      allowNonFunctionalCookies: Boolean(parsed.allowNonFunctionalCookies),
      hasHydrated: true,
    });
  } catch {
    setHasHydrated(true);
  }
}

function identitySelector(state: Store) {
  return state;
}

function useCookiesConsentStore<T = Store>(selector?: (state: Store) => T) {
  const select = selector ?? (identitySelector as (state: Store) => T);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => select(storeState),
    () => select(storeState),
  );

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  return snapshot;
}

export default useCookiesConsentStore;
