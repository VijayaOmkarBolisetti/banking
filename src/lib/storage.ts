export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

export interface SyncStorage {
  getItem(name: string): string | null
  setItem(name: string, value: string): void
  removeItem(name: string): void
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>()
  return {
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => {
      map.set(key, value)
    },
    removeItem: async (key) => {
      map.delete(key)
    },
  }
}

export function createWebStorage(): KeyValueStorage {
  return {
    getItem: async (key) => {
      if (typeof localStorage === 'undefined') return null
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: async (key, value) => {
      if (typeof localStorage === 'undefined') return
      try {
        localStorage.setItem(key, value)
      } catch {
        /* ignore quota / private mode */
      }
    },
    removeItem: async (key) => {
      if (typeof localStorage === 'undefined') return
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
    },
  }
}

export const zustandSyncStorage: SyncStorage = {
  getItem: (name) => {
    if (typeof localStorage === 'undefined') return null
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(name, value)
    } catch {
      /* ignore */
    }
  },
  removeItem: (name) => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}
