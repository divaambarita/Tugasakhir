export type AuthExpiredReason = {
  status?: number;
  message?: string;
};

type Listener = (reason?: AuthExpiredReason) => void;

const listeners = new Set<Listener>();

export function onAuthExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitAuthExpired(reason?: AuthExpiredReason): void {
  for (const listener of Array.from(listeners)) {
    try {
      listener(reason);
    } catch {
      // ignore listener errors
    }
  }
}
