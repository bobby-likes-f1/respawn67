import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utils Functions", () => {
  describe("cn", () => {
    it("should merge single class", () => {
      const result = cn("p-4");
      expect(result).toBe("p-4");
    });

    it("should merge multiple classes", () => {
      const result = cn("p-4", "text-lg", "font-bold");
      expect(result).toContain("p-4");
      expect(result).toContain("text-lg");
      expect(result).toContain("font-bold");
    });

    it("should handle conditional classes with arrays", () => {
      const result = cn(["p-4", "text-lg"]);
      expect(result).toContain("p-4");
      expect(result).toContain("text-lg");
    });

    it("should resolve Tailwind class conflicts correctly", () => {
      const result = cn("px-2", false && "hidden", "px-4", "font-bold");
      expect(result).toBe("px-4 font-bold");
    });

    it("should handle objects with conditional classes", () => {
      const result = cn({
        "p-4": true,
        "text-lg": false,
        "font-bold": true,
      });
      expect(result).toContain("p-4");
      expect(result).toContain("font-bold");
      expect(result).not.toContain("text-lg");
    });

    it("should handle mixed types", () => {
      const result = cn("p-4", { "text-lg": true }, ["font-bold"]);
      expect(result).toContain("p-4");
      expect(result).toContain("text-lg");
      expect(result).toContain("font-bold");
    });

    it("should ignore falsy values", () => {
      const result = cn("p-4", null, undefined, false, "text-lg");
      expect(result).toContain("p-4");
      expect(result).toContain("text-lg");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBeDefined();
    });

    it("should handle responsive Tailwind classes", () => {
      const result = cn("md:p-4", "lg:p-8");
      expect(result).toContain("md:p-4");
      expect(result).toContain("lg:p-8");
    });

    it("should handle dark mode classes", () => {
      const result = cn("text-black", "dark:text-white");
      expect(result).toContain("text-black");
      expect(result).toContain("dark:text-white");
    });
  });
});
