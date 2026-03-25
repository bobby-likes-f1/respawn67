const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "/api/v1";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type SignupResponse = {
  message: string;
  user: AuthUser;
};

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringOrUndefined(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function normalizeAuthUser(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  const id = toNumber(raw.id ?? raw.ID);
  const username = toStringOrUndefined(raw.username);
  const email = toStringOrUndefined(raw.email);
  const createdAt =
    toStringOrUndefined(raw.createdAt) ??
    toStringOrUndefined(raw.created_at) ??
    toStringOrUndefined(raw.CreatedAt);

  if (id === null || !username || !email) {
    return null;
  }

  return {
    id,
    username,
    email,
    createdAt,
  };
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) {
      return msg;
    }
  }
  return fallback;
}

export async function signup(payload: {
  username: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as SignupResponse | { message?: string };

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Signup failed"));
  }

  return data as SignupResponse;
}

export async function login(payload: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as LoginResponse | { message?: string };

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Login failed"));
  }

  const normalizedUser = normalizeAuthUser((data as { user?: unknown }).user);
  if (!normalizedUser) {
    throw new Error("Invalid user payload from server");
  }

  return {
    ...(data as Omit<LoginResponse, "user">),
    user: normalizedUser,
  } as LoginResponse;
}

export function saveSession(session: { token: string; user: AuthUser }) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("token", session.token);
  localStorage.setItem("user", JSON.stringify(session.user));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("token");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("user");
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeAuthUser(parsed);
  } catch {
    return null;
  }
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export function getMemberSinceLabel(user: AuthUser | null) {
  if (!user?.createdAt) {
    return null;
  }

  const parsed = new Date(user.createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getFullYear().toString();
}
