// Wishlist saved in the browser (localStorage), shared by every heart button and the `/wishlist` page.
// Client-safe; nothing here touches the server. The pure helpers at the top are unit-tested.

import { useSyncExternalStore } from "react";

export const WISHLIST_STORAGE_KEY = "le-wishlist";

/** Oldest saves are dropped past this, so a corrupted or abused entry can't grow without bound. */
export const MAX_WISHLIST_ITEMS = 100;

const MAX_SLUG_LENGTH = 200;

const EMPTY: readonly string[] = Object.freeze([]);

// ---------------------------------------------------------------------------
// Pure helpers

/** Reads a stored value leniently: anything malformed becomes an empty list, unknown entries are dropped. */
export function parseWishlist(raw: string | null | undefined): readonly string[] {
  if (!raw) return EMPTY;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!Array.isArray(value)) return EMPTY;

  const slugs: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || !entry || entry.length > MAX_SLUG_LENGTH || slugs.includes(entry)) continue;
    slugs.push(entry);
    if (slugs.length === MAX_WISHLIST_ITEMS) break;
  }
  return slugs;
}

export function serializeWishlist(slugs: readonly string[]): string {
  return JSON.stringify(slugs);
}

/** Removes `slug` if saved, otherwise saves it first in the list (most recent first). */
export function toggleWishlistSlug(slugs: readonly string[], slug: string): readonly string[] {
  if (slugs.includes(slug)) return slugs.filter((saved) => saved !== slug);
  return [slug, ...slugs].slice(0, MAX_WISHLIST_ITEMS);
}

// ---------------------------------------------------------------------------
// Store

const listeners = new Set<() => void>();

// Used once localStorage is unavailable or refuses a write (private mode, quota, blocked storage), so the
// wishlist still works for the rest of the visit.
let memoryRaw: string | null = null;
let storageFailed = false;

// getSnapshot must return the same array while the stored value is unchanged.
let cachedRaw: string | null | undefined;
let cachedSlugs: readonly string[] = EMPTY;

function readRaw(): string | null {
  if (storageFailed) return memoryRaw;
  try {
    return window.localStorage.getItem(WISHLIST_STORAGE_KEY);
  } catch {
    storageFailed = true;
    return memoryRaw;
  }
}

function writeRaw(raw: string) {
  memoryRaw = raw;
  if (storageFailed) return;
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, raw);
  } catch {
    storageFailed = true;
  }
}

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSlugs = parseWishlist(raw);
  }
  return cachedSlugs;
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  // `key` is null when another tab clears all storage.
  if (event.key === WISHLIST_STORAGE_KEY || event.key === null) emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Saved product slugs, most recent first. Empty on the server and during hydration. */
export function useWishlist(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleWishlist(slug: string) {
  writeRaw(serializeWishlist(toggleWishlistSlug(getSnapshot(), slug)));
  emit();
}

function subscribeNever() {
  return () => {};
}

/**
 * False on the server and during hydration, true once the client has rendered. Lets the wishlist page show a
 * placeholder instead of flashing "empty" before localStorage has been read.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
