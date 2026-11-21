import type { ApiFailure, ApiFieldError, ApiSuccess, Paginated } from "@/types/api";

/** Error thrown for every non-2xx answer. `errors` carries the API's field-level messages. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiFieldError[];
  readonly code?: string;

  constructor(status: number, message: string, errors: ApiFieldError[] = [], code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

export const SESSION_EXPIRED_EVENT = "cityfix:session-expired";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
}

export function toSearch(query?: QueryParams): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

// The API rotates refresh tokens and treats a replayed one as theft, so concurrent 401s
// must share ONE refresh call.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => {
        refreshing = null;
      }, 0);
    });
  return refreshing;
}

async function parse<T>(res: Response): Promise<ApiSuccess<T>> {
  const body = (await res.json().catch(() => null)) as (ApiSuccess<T> | (ApiFailure & { code?: string })) | null;
  if (!res.ok || !body || body.success === false) {
    const failure = body && body.success === false ? body : null;
    throw new ApiError(
      res.status,
      failure?.message ?? (res.status >= 500 ? "Server error. Please try again" : `Request failed (${res.status})`),
      failure?.errors ?? [],
      failure?.code,
    );
  }
  return body;
}

async function send(path: string, { method = "GET", body, query, signal }: RequestOptions): Promise<Response> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  return fetch(`/api/proxy${path}${toSearch(query)}`, {
    method,
    signal,
    credentials: "same-origin",
    headers: body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
}

/** Calls the CityFix API through the BFF proxy, refreshing the session once if needed. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  let res: Response;
  try {
    res = await send(path, options);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "Network error. Check your connection and try again");
  }

  if (res.status === 401) {
    const peek = (await res
      .clone()
      .json()
      .catch(() => null)) as { code?: string } | null;
    if (peek?.code === "TOKEN_EXPIRED") {
      const ok = await refreshSession();
      if (ok) {
        res = await send(path, options);
      } else if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }
  }
  return parse<T>(res);
}

export const api = {
  get: async <T>(path: string, query?: QueryParams, signal?: AbortSignal) =>
    (await request<T>(path, { query, signal })).data,
  list: async <T>(path: string, query?: QueryParams, signal?: AbortSignal): Promise<Paginated<T>> => {
    const res = await request<T[]>(path, { query, signal });
    return {
      items: res.data,
      meta: res.meta ?? { page: 1, limit: res.data.length, total: res.data.length, totalPages: 1 },
    };
  },
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ?? {} }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};

/** Login / register / logout go to dedicated route handlers that manage the cookies. */
export async function authRequest<T>(path: "login" | "register" | "logout", body?: unknown) {
  let res: Response;
  try {
    res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiError(0, "Network error. Check your connection and try again");
  }
  return parse<T>(res);
}

/** Human-readable message for any thrown value. */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof ApiError) {
    const detail = err.errors.find((e) => !e.path)?.message;
    return detail && err.message === "Validation failed" ? detail : err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
