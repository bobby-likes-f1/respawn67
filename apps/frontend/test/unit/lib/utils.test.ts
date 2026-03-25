import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4", "font-bold")).toBe("px-4 font-bold");
  });
});