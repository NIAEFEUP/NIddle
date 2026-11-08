const TOKEN_KEY = "niddle_auth_token";

let onUnauthorizedHandler: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorizedHandler = handler;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusCode: number;
  readonly data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusCode = status;
    this.data = data;
  }
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    itemCount: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export function unwrapData<T>(
  response: T[] | PaginatedResponse<T> | null | undefined,
): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as { data: unknown }).data)
  ) {
    return (response as { data: T[] }).data;
  }
  return [];
}

export async function fetchAllPages<T>(
  endpoint: string,
  options: RequestInit = {},
  pageSize = 100,
): Promise<T[]> {
  const [base, query = ""] = endpoint.split("?");
  const searchParams = new URLSearchParams(query);
  searchParams.set("limit", String(pageSize));
  searchParams.set("page", "1");

  const firstUrl = `${base}?${searchParams.toString()}`;
  const firstRes = await apiClient<T[] | PaginatedResponse<T>>(
    firstUrl,
    options,
  );

  if (Array.isArray(firstRes)) {
    return firstRes;
  }

  if (
    !firstRes ||
    typeof firstRes !== "object" ||
    !("data" in firstRes) ||
    !Array.isArray(firstRes.data)
  ) {
    return unwrapData(firstRes);
  }

  const items = [...firstRes.data];
  const totalPages = firstRes.meta?.totalPages ?? 1;

  if (totalPages > 1) {
    const pageNumbers: number[] = [];
    for (let p = 2; p <= totalPages; p++) {
      pageNumbers.push(p);
    }

    const CONCURRENCY_LIMIT = 3;
    for (let i = 0; i < pageNumbers.length; i += CONCURRENCY_LIMIT) {
      const chunk = pageNumbers.slice(i, i + CONCURRENCY_LIMIT);
      const chunkPromises = chunk.map((p) => {
        const nextParams = new URLSearchParams(query);
        nextParams.set("limit", String(pageSize));
        nextParams.set("page", String(p));
        const pageUrl = `${base}?${nextParams.toString()}`;
        return apiClient<T[] | PaginatedResponse<T>>(pageUrl, options);
      });
      const subsequentPages = await Promise.all(chunkPromises);
      for (const pageRes of subsequentPages) {
        if (
          pageRes &&
          typeof pageRes === "object" &&
          "data" in pageRes &&
          Array.isArray(pageRes.data)
        ) {
          items.push(...pageRes.data);
        } else if (Array.isArray(pageRes)) {
          items.push(...pageRes);
        }
      }
    }
  }

  return items;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const authHeader = headers.get("Authorization");
      const isStoredToken =
        Boolean(token) &&
        getToken() === token &&
        (!authHeader || authHeader === `Bearer ${token}`);

      if (isStoredToken) {
        removeToken();
        onUnauthorizedHandler?.();
      }
    }

    let errorMessage = response.statusText || "An unexpected error occurred";
    let errorData: unknown = null;

    try {
      errorData = await response.json();
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "message" in errorData &&
        typeof (errorData as { message: unknown }).message === "string"
      ) {
        errorMessage = (errorData as { message: string }).message;
      }
    } catch {}

    throw new ApiError(response.status, errorMessage, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
