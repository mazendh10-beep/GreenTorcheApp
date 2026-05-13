import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { demoGames, getDemoGameById, getDemoGames, getDemoReviews } from "./demoData";
import type {
  AnalyticsOverview,
  DeveloperAnalytics,
  Game,
  GameInput,
  PaginatedGamesResponse,
  Review,
  ReviewInput,
  User,
  UserReview
} from "../types";

const API_BASE_URL = API_URL.trim();
const TOKEN_KEY = "greentorch_token";
const REQUEST_TIMEOUT_MS = 10000;
const getCache = new Map<string, { expiresAt: number; data: unknown }>();
const pendingRequests = new Map<string, Promise<unknown>>();

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiError extends Error {
  status?: number;
}

let tokenCache: string | null = null;

const getMessageFromPayload = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const maybeMessage = (payload as { message?: unknown }).message;
  return typeof maybeMessage === "string" ? maybeMessage : null;
};

const parseResponsePayload = async (response: Response) => {
  const raw = await response.text();
  if (!raw) return {};

  const contentType = response.headers.get("content-type") ?? "";
  const looksLikeJson = contentType.includes("application/json");

  if (looksLikeJson) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new Error("API returned invalid JSON.");
    }
  }

  const snippet = raw.slice(0, 120).replace(/\s+/g, " ").trim();
  throw new Error(`API returned non-JSON content: ${snippet}`);
};

const clearGetCache = () => {
  getCache.clear();
};

const createApiUnavailableError = () => {
  const err = new Error(
    "API server is not configured. Set EXPO_PUBLIC_API_URL to enable login and saved changes."
  ) as ApiError;
  err.status = 0;
  return err;
};

const getDemoResponse = (
  path: string,
  method: HttpMethod,
  requiresAuth: boolean
): { handled: true; data: unknown } | { handled: false } => {
  if (method === "GET" && !requiresAuth) {
    if (path === "/games/popular") {
      return { handled: true, data: demoGames.slice(0, 3) };
    }

    if (path.startsWith("/games?") || path === "/games") {
      const query = path.includes("?") ? path.slice(path.indexOf("?") + 1) : "";
      return { handled: true, data: getDemoGames(Object.fromEntries(new URLSearchParams(query))) };
    }

    const gameMatch = path.match(/^\/games\/([^/]+)$/);
    if (gameMatch) {
      const game = getDemoGameById(gameMatch[1]);
      if (game) return { handled: true, data: game };
    }

    const reviewMatch = path.match(/^\/reviews\/game\/([^/]+)$/);
    if (reviewMatch) {
      return { handled: true, data: getDemoReviews(reviewMatch[1]) };
    }
  }

  if (method === "POST" && !requiresAuth && path.match(/^\/analytics\/views\/[^/]+$/)) {
    return { handled: true, data: {} };
  }

  return { handled: false };
};

const isNetworkFailure = (error: unknown) =>
  error instanceof TypeError || (error instanceof Error && error.message === "Network request failed");

const getRequestCacheTtl = (path: string) => {
  if (path.includes("/games/popular")) return 60_000;
  if (path.startsWith("/games?")) return 20_000;
  if (path.includes("/games/") && !path.includes("/download")) return 30_000;
  if (path.includes("/reviews/game/")) return 15_000;
  if (path.includes("/analytics/")) return 20_000;
  if (path.includes("/users/me")) return 15_000;
  if (path === "/users") return 20_000;
  if (path === "/reviews/me") return 15_000;
  return 0;
};

export const getToken = async () => {
  if (tokenCache !== null) return tokenCache;
  tokenCache = await AsyncStorage.getItem(TOKEN_KEY);
  return tokenCache;
};

export const setToken = async (token: string) => {
  tokenCache = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = async () => {
  tokenCache = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
};

const request = async <T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
  requiresAuth = false
): Promise<T> => {
  const cacheKey = `${method}:${path}:${body ? JSON.stringify(body) : ""}`;
  const ttlMs = method === "GET" ? getRequestCacheTtl(path) : 0;

  if (ttlMs > 0) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const token = requiresAuth ? await getToken() : null;

  const execute = async () => {
    if (!API_BASE_URL) {
      const demoResponse = getDemoResponse(path, method, requiresAuth);
      if (demoResponse.handled) {
        if (ttlMs > 0) {
          getCache.set(cacheKey, {
            expiresAt: Date.now() + ttlMs,
            data: demoResponse.data
          });
        }

        return demoResponse.data as T;
      }

      throw createApiUnavailableError();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(requiresAuth && token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      if (!response.ok) {
        const payload = await parseResponsePayload(response).catch(() => ({}));
        const fallbackMessage =
          response.status === 503
            ? "Service temporarily unavailable. Please retry shortly."
            : `Request failed (${response.status})`;
        const err = new Error(getMessageFromPayload(payload) ?? fallbackMessage) as ApiError;
        err.status = response.status;
        throw err;
      }

      if (response.status === 204) {
        clearGetCache();
        return {} as T;
      }

      const parsed = (await parseResponsePayload(response)) as T;

      if (ttlMs > 0) {
        getCache.set(cacheKey, {
          expiresAt: Date.now() + ttlMs,
          data: parsed
        });
      } else if (method !== "GET") {
        clearGetCache();
      }

      return parsed;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError = new Error("Request timed out. Please try again.") as ApiError;
        timeoutError.status = 408;
        throw timeoutError;
      }

      if (!requiresAuth && isNetworkFailure(error)) {
        const demoResponse = getDemoResponse(path, method, requiresAuth);
        if (demoResponse.handled) {
          if (ttlMs > 0) {
            getCache.set(cacheKey, {
              expiresAt: Date.now() + ttlMs,
              data: demoResponse.data
            });
          }

          return demoResponse.data as T;
        }
      }

      if (error instanceof Error) {
        throw error;
      }

      const err = new Error(
        "Unable to reach the API server. Check that backend is running and API URL is correct."
      ) as ApiError;
      err.status = 0;
      throw err;
    } finally {
      clearTimeout(timeout);
      pendingRequests.delete(cacheKey);
    }
  };

  const promise = execute();
  if (ttlMs > 0) {
    pendingRequests.set(cacheKey, promise);
  }
  return promise;
};

export const authApi = {
  register: (payload: { name: string; email: string; password: string; role?: string }) =>
    request<{ token: string; user: User }>("/auth/register", "POST", payload),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/auth/login", "POST", payload),
  me: () => request<User>("/users/me", "GET", undefined, true)
};

export const userApi = {
  updateProfile: (payload: { name?: string; bio?: string; avatarUrl?: string }) =>
    request<User>("/users/me", "PATCH", payload, true),
  getAllUsers: () => request<User[]>("/users", "GET", undefined, true),
  updateRole: (userId: number, role: string) =>
    request<User>(`/users/${userId}/role`, "PATCH", { role }, true)
};

export const gameApi = {
  list: (query: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request<PaginatedGamesResponse>(`/games${suffix}`);
  },
  mine: () => request<Game[]>("/games/mine", "GET", undefined, true),
  popular: () => request<Game[]>("/games/popular", "GET"),
  getById: (id: number | string) => request<Game>(`/games/${id}`, "GET"),
  create: (payload: GameInput) => request<Game>("/games", "POST", payload, true),
  update: (id: number, payload: GameInput) => request<Game>(`/games/${id}`, "PUT", payload, true),
  remove: (id: number) => request<void>(`/games/${id}`, "DELETE", undefined, true),
  markDownload: (id: number) =>
    request<{ downloadUrl: string }>(`/games/${id}/download`, "POST", {}, true)
};

export const reviewApi = {
  listForGame: (gameId: number | string) => request<Review[]>(`/reviews/game/${gameId}`),
  create: (gameId: number, payload: ReviewInput) =>
    request<Review>(`/reviews/game/${gameId}`, "POST", payload, true),
  mine: () => request<UserReview[]>("/reviews/me", "GET", undefined, true),
  remove: (reviewId: number) => request<void>(`/reviews/${reviewId}`, "DELETE", undefined, true)
};

export const analyticsApi = {
  trackView: (gameId: number | string) => request<void>(`/analytics/views/${gameId}`, "POST"),
  developer: () => request<DeveloperAnalytics[]>("/analytics/developer", "GET", undefined, true),
  overview: () => request<AnalyticsOverview>("/analytics/admin/overview", "GET", undefined, true)
};
