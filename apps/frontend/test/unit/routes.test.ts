import { describe, expect, it } from "vitest";
import routes from "@/routes";

describe("routes", () => {
  it("exports an array of route configs", () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it("includes index route", () => {
    expect(routes.some((r: any) => r.index === true || r.file === "routes/_index.tsx")).toBe(true);
  });

  it("includes login route", () => {
    expect(routes.some((r: any) => r.path === "login")).toBe(true);
  });

  it("includes signup route", () => {
    expect(routes.some((r: any) => r.path === "signup")).toBe(true);
  });

  it("includes games route", () => {
    expect(routes.some((r: any) => r.path === "games")).toBe(true);
  });

  it("includes game/:id route", () => {
    expect(routes.some((r: any) => r.path === "games/:id")).toBe(true);
  });

  it("includes account route", () => {
    expect(routes.some((r: any) => r.path === "account")).toBe(true);
  });
});
