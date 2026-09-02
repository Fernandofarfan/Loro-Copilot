// Tipos globales para APIs del navegador que no están en lib.dom.d.ts estándar
// o que requieren una declaración más estricta que `any`.

interface WakeLockSentinel {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener(type: "release", listener: () => void): void;
  removeEventListener(type: "release", listener: () => void): void;
}

interface WakeLock {
  request(type: "screen"): Promise<WakeLockSentinel>;
}

interface Navigator {
  readonly wakeLock?: WakeLock;
}
