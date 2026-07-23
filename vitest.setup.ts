import "@testing-library/jest-dom";

if (typeof globalThis.localStorage === "undefined") {
  const storage: Record<string, string> = {};

  const localStorageMock = {
    getItem: (key: string) => (storage[key] !== undefined ? storage[key] : null),
    setItem: (key: string, value: string) => {
      storage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const key in storage) {
        delete storage[key];
      }
    },
    key: (index: number) => Object.keys(storage)[index] ?? null,
    get length() {
      return Object.keys(storage).length;
    },
  } as Storage;

  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}
