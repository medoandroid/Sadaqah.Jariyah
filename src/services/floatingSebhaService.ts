import { storageService } from './storageService';

type Listener = (isOpen: boolean) => void;
const listeners = new Set<Listener>();

const STORAGE_KEY = 'floating_sebha_enabled';

export const floatingSebhaService = {
  isOpen(): boolean {
    return storageService.get<boolean>(STORAGE_KEY, false);
  },

  setOpen(open: boolean): void {
    storageService.set(STORAGE_KEY, open);
    listeners.forEach((fn) => fn(open));
  },

  toggle(): boolean {
    const next = !this.isOpen();
    this.setOpen(next);
    return next;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
