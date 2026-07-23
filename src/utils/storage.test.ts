import { describe, it, expect, beforeEach } from "vitest";
import { getStorageItem, removeStorageItem, setStorageItem } from "./storage";

describe("storage utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and reads JSON values", () => {
    setStorageItem("key", { value: 123 });

    expect(getStorageItem<{ value: number }>("key")).toEqual({ value: 123 });
  });

  it("returns null when key is missing", () => {
    expect(getStorageItem("missing")).toBeNull();
  });

  it("removes items from localStorage", () => {
    setStorageItem("key", "value");
    removeStorageItem("key");

    expect(localStorage.getItem("key")).toBeNull();
  });
});
