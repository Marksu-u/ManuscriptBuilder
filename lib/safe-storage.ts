export const safeStorage = {
  getItem(name: string): string | null {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem(name: string, value: string): void {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(name, value); } catch { /* best-effort storage */ }
  },
  removeItem(name: string): void {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(name); } catch { /* storage unavailable */ }
  },
};
