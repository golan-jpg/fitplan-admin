import { API_BASE_URL } from "@/config/runtimeConfig";
import { ApiError } from "@/contracts";

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions<TBody = unknown, TQuery extends Record<string, unknown> = Record<string, unknown>> = {
  method: RequestMethod;
  url: string;
  body?: TBody;
  query?: TQuery;
  headers?: HeadersInit;
};

export class HttpRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  responseText?: string;

  constructor(message: string, status: number, payload?: ApiError | unknown, responseText?: string) {
    super(message);
    this.name = "HttpRequestError";
    this.status = status;
    this.responseText = responseText;

    if (payload && typeof payload === "object" && "code" in payload) {
      const apiError = payload as ApiError;
      this.code = apiError.code;
      this.details = apiError.details;
    } else if (payload !== undefined) {
      this.details = payload;
    }
  }
}

function buildUrl(path: string, query?: Record<string, unknown>) {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`, origin);

  if (!query) {
    return url.toString();
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    if (value instanceof Date) {
      url.searchParams.set(key, value.toISOString());
      return;
    }

    if (typeof value === "object") {
      url.searchParams.set(key, JSON.stringify(value));
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function getResponseMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    if ("error" in payload) {
      const errorValue = (payload as { error?: unknown }).error;
      if (errorValue && typeof errorValue === "object" && "message" in errorValue) {
        const message = (errorValue as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) {
          return message;
        }
      }
    }

    if ("message" in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return fallback;
}

export async function request<TResponse, TBody = unknown, TQuery extends Record<string, unknown> = Record<string, unknown>>(
  options: RequestOptions<TBody, TQuery>
): Promise<TResponse> {
  const { method, url, body, query, headers } = options;
  const requestUrl = buildUrl(url, query);
  const hasBody = body !== undefined && method !== "GET";
  const response = await fetch(requestUrl, {
    method,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "");

  if (!response.ok) {
    throw new HttpRequestError(
      getResponseMessage(payload, `HTTP ${response.status}`),
      response.status,
      payload,
      isJson ? JSON.stringify(payload) : String(payload)
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return payload as TResponse;
}
