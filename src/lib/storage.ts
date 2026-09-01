export interface SyncStorage {
  getItem(name: string): string | null
  setItem(name: string, value: string): void
  removeItem(name: string): void
}

/**
 * localStorage wrapper that degrades to a no-op instead of throwing.
 * Private-browsing modes and quota errors must not take the app down.
 */
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
      /* ignore quota / private mode */
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
