export interface ReadingPosition {
  scrollTop: number;
  at: number;
}

const READING_KEY_PREFIX = "reading:";
const EMPTY_SLUGS: readonly string[] = [];

const listeners = new Set<() => void>();
let startedSlugsCache: readonly string[] | null = null;

const keyFor = (slug: string) => `${READING_KEY_PREFIX}${slug}`;

function isReadingPosition(value: unknown): value is ReadingPosition {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Record<keyof ReadingPosition, unknown>>;
  return (
    typeof candidate.scrollTop === "number" && typeof candidate.at === "number"
  );
}

function notifyListeners() {
  startedSlugsCache = null;
  for (const listener of listeners) listener();
}

export function saveReadingPosition(slug: string, scrollTop: number): void {
  try {
    localStorage.setItem(
      keyFor(slug),
      JSON.stringify({ scrollTop, at: Date.now() }),
    );
    notifyListeners();
  } catch {
    // Quota or private-mode writes can fail; resume-reading is a progressive
    // enhancement, so losing the resume point is acceptable
  }
}

export function getReadingPosition(slug: string): ReadingPosition | null {
  try {
    const raw = localStorage.getItem(keyFor(slug));
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isReadingPosition(parsed) ? parsed : null;
  } catch {
    // Unavailable storage or corrupt JSON both mean "no saved position"
    return null;
  }
}

export function clearReadingPosition(slug: string): void {
  try {
    localStorage.removeItem(keyFor(slug));
    notifyListeners();
  } catch {
    // Same progressive-enhancement rationale as saveReadingPosition
  }
}

export function listReadingSlugs(): string[] {
  try {
    const slugs: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(READING_KEY_PREFIX)) {
        slugs.push(key.slice(READING_KEY_PREFIX.length));
      }
    }
    return slugs;
  } catch {
    // Unavailable storage means "nothing started"
    return [];
  }
}

export function subscribeToReadingPositions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Snapshot is cached between notifications so useSyncExternalStore sees a
// referentially stable value and does not re-render in a loop
export function getStartedSlugsSnapshot(): readonly string[] {
  startedSlugsCache ??= listReadingSlugs();
  return startedSlugsCache;
}

export function getServerStartedSlugsSnapshot(): readonly string[] {
  return EMPTY_SLUGS;
}
