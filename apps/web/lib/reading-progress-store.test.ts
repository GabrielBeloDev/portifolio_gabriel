import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as ReadingProgressStore from "./reading-progress-store";

type Store = typeof ReadingProgressStore;

function fakeLocalStorage(entries = new Map<string, string>()) {
  return {
    get length() {
      return entries.size;
    },
    key: (index: number) => [...entries.keys()][index] ?? null,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  };
}

// The store keeps module-level listeners and a snapshot cache, so each test
// gets a fresh module instance
async function freshStore(): Promise<Store> {
  vi.resetModules();
  return import("./reading-progress-store");
}

describe("reading-progress-store", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
  });

  it("salva e lê a posição de um slug", async () => {
    const store = await freshStore();

    store.saveReadingPosition("meu-post", 840);

    const position = store.getReadingPosition("meu-post");
    expect(position?.scrollTop).toBe(840);
    expect(position?.at).toBeTypeOf("number");
  });

  it("retorna null para slug sem posição salva", async () => {
    const store = await freshStore();
    expect(store.getReadingPosition("nunca-lido")).toBeNull();
  });

  it("retorna null para valor corrompido no storage", async () => {
    const entries = new Map([
      ["reading:json-invalido", "{nope"],
      ["reading:shape-errado", JSON.stringify({ scrollTop: "800" })],
    ]);
    vi.stubGlobal("localStorage", fakeLocalStorage(entries));
    const store = await freshStore();

    expect(store.getReadingPosition("json-invalido")).toBeNull();
    expect(store.getReadingPosition("shape-errado")).toBeNull();
  });

  it("clear remove a posição do slug", async () => {
    const store = await freshStore();
    store.saveReadingPosition("meu-post", 840);

    store.clearReadingPosition("meu-post");

    expect(store.getReadingPosition("meu-post")).toBeNull();
    expect(store.listReadingSlugs()).toEqual([]);
  });

  it("lista apenas os slugs com prefixo reading:", async () => {
    const entries = new Map([["tema", "dark"]]);
    vi.stubGlobal("localStorage", fakeLocalStorage(entries));
    const store = await freshStore();

    store.saveReadingPosition("post-a", 700);
    store.saveReadingPosition("post-b", 900);

    expect(store.listReadingSlugs().sort()).toEqual(["post-a", "post-b"]);
  });

  it("engole falha de quota sem lançar", async () => {
    vi.stubGlobal("localStorage", {
      ...fakeLocalStorage(),
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
    });
    const store = await freshStore();

    expect(() => store.saveReadingPosition("meu-post", 840)).not.toThrow();
    expect(store.getReadingPosition("meu-post")).toBeNull();
  });

  it("notifica assinantes e invalida o snapshot ao salvar e limpar", async () => {
    const store = await freshStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribeToReadingPositions(listener);

    expect(store.getStartedSlugsSnapshot()).toEqual([]);

    store.saveReadingPosition("meu-post", 840);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getStartedSlugsSnapshot()).toEqual(["meu-post"]);

    store.clearReadingPosition("meu-post");
    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.getStartedSlugsSnapshot()).toEqual([]);

    unsubscribe();
    store.saveReadingPosition("outro-post", 700);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("mantém o snapshot referencialmente estável entre notificações", async () => {
    const store = await freshStore();
    store.saveReadingPosition("meu-post", 840);

    expect(store.getStartedSlugsSnapshot()).toBe(
      store.getStartedSlugsSnapshot(),
    );
  });
});
