// ============================================================
// Custom Stockroom Store (Local Storage & AI Generation)
// Allows users to generate missing solutions, glassware, and tools
// using Google Gemini AI and save them to the interactive workbench
// ============================================================

import { StockItemDefinition } from '@/components/laboratory/Stockroom';

const CUSTOM_STOCK_KEY = 'chemlab_custom_stockroom_items_v2';

export interface CustomStockItem extends StockItemDefinition {
  isAiGenerated?: boolean;
  createdAt?: number;
  promptUsed?: string;
}

export function loadCustomStockItems(): CustomStockItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_STOCK_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomStockItem(item: CustomStockItem): CustomStockItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadCustomStockItems();
    // Prevent duplicate IDs
    const exists = current.some((i) => i.id === item.id);
    const updated = exists
      ? current.map((i) => (i.id === item.id ? item : i))
      : [item, ...current];

    localStorage.setItem(CUSTOM_STOCK_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('chemlab-stockroom-changed', { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function removeCustomStockItem(id: string): CustomStockItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadCustomStockItems();
    const updated = current.filter((i) => i.id !== id);
    localStorage.setItem(CUSTOM_STOCK_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('chemlab-stockroom-changed', { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function clearCustomStockItems(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_STOCK_KEY);
    window.dispatchEvent(new CustomEvent('chemlab-stockroom-changed', { detail: [] }));
  } catch {}
}
