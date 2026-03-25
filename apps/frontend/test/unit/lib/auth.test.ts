import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  signup,
  login,
  saveSession,
  clearSession,
  getToken,
  getStoredUser,
  getInitials,
  getMemberSinceLabel,
  type AuthUser,
} from "@/lib/auth";

// Mock fetch
global.fetch = vi.fn();

describe("Auth Functions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("signup", () => {
    it("should successfully sign up a user", async () => {
      const mockResponse = {
        message: "Signup successful",
        user: { id: 1, username: "newuser", email: "new@example.com" },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await signup({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
      });

      expect(result).toEqual(mockResponse);
    });

    it("should throw error on signup failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Email already registered" }),
      } as Response);

      await expect(
        signup({
          username: "newuser",
          email: "existing@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Email already registered");
    });

    it("should use fallback error message", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(
        signup({
          username: "newuser",
          email: "new@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Signup failed");
    });
  });

  describe("login", () => {
    it("should successfully login", async () => {
      const mockResponse = {
        message: "Login successful",
        token: "fake-jwt-token",
        user: { id: 1, username: "testuser", email: "test@example.com" },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.token).toBe("fake-jwt-token");
      expect(result.user.id).toBe(1);
    });

    it("should throw error on invalid credentials", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid email or password" }),
      } as Response);

      await expect(
        login({
          email: "wrong@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error on invalid user payload", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "fake-token",
          user: { username: "nouser" },
        }),
      } as Response);

      await expect(
        login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Invalid user payload from server");
    });
  });

  describe("saveSession", () => {
    it("should save token and user to localStorage", () => {
      const user: AuthUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };

      saveSession({ token: "fake-token", user });

      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(localStorage.getItem("user")).toBe(JSON.stringify(user));
    });
  });

  describe("clearSession", () => {
    it("should remove token and user from localStorage", () => {
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("user", '{"id": 1}');

      clearSession();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("getToken", () => {
    it("should retrieve token from localStorage", () => {
      localStorage.setItem("token", "fake-token");
      expect(getToken()).toBe("fake-token");
    });

    it("should return null if token not found", () => {
      expect(getToken()).toBeNull();
    });
  });

  describe("getStoredUser", () => {
    it("should retrieve user from localStorage", () => {
      const user: AuthUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };

      localStorage.setItem("user", JSON.stringify(user));
      expect(getStoredUser()).toEqual(user);
    });

    it("should return null if user not found", () => {
      expect(getStoredUser()).toBeNull();
    });

    it("should return null if user JSON is invalid", () => {
      localStorage.setItem("user", "invalid-json");
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("getInitials", () => {
    it("should return initials from names", () => {
      expect(getInitials("John")).toBe("J");
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("John Michael Doe")).toBe("JM");
    });

    it("should return U for empty string", () => {
      expect(getInitials("")).toBe("U");
      expect(getInitials("   ")).toBe("U");
    });
  });

  describe("getMemberSinceLabel", () => {
    it("should return year from createdAt", () => {
      const user: AuthUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        createdAt: "2023-06-15T10:30:00Z",
      };

      expect(getMemberSinceLabel(user)).toBe("2023");
    });

    it("should return null if createdAt is missing or invalid", () => {
      const user: AuthUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };

      expect(getMemberSinceLabel(user)).toBeNull();
      expect(getMemberSinceLabel(null)).toBeNull();
    });
  });
});
