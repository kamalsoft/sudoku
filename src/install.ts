import { create } from 'zustand';
import { Platform } from 'react-native';

// The browser's install prompt is captured once and used when the player asks for it.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallState {
  canInstall: boolean;
  installed: boolean;
  ios: boolean;
  promptInstall: () => Promise<void>;
}

let deferred: BeforeInstallPromptEvent | null = null;

export const useInstall = create<InstallState>()((set) => ({
  canInstall: false,
  installed: false,
  ios: false,
  promptInstall: async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    set({ canInstall: false, installed: outcome === 'accepted' });
  },
}));

// Runs once on web: registers the offline service worker in production and listens for the install prompt.
export function initPwa() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  useInstall.setState({ installed: standalone, ios: ios && !standalone });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    useInstall.setState({ canInstall: true });
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    useInstall.setState({ canInstall: false, installed: true });
  });

  // The service worker caches files, which would hide updates during development, so it runs only in production builds.
  if (!__DEV__ && 'serviceWorker' in navigator) {
    const register = () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Service worker failed', error));
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
}
