import axios from 'axios';
import type { ApiError } from '@/shared/types';

/**
 * Backend error body:
 * { "error": "access denied", "message": "Access Denied", "status": 403, "timestamp": 1781859213586 }
 *
 * Validation failures (400) may additionally carry field details, so we read
 * a few common shapes defensively (errors / details / fieldErrors).
 */
type LooseBody = Partial<ApiError> & {
  errors?: unknown;
  details?: unknown;
  fieldErrors?: unknown;
};

const STATUS_FALLBACK: Record<number, string> = {
  400: 'The request was invalid. Please check the entered values.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested item could not be found.',
  409: 'This conflicts with existing data.',
  413: 'The uploaded file is too large.',
  415: 'Unsupported file or content type.',
  422: 'The submitted data could not be processed.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on the server. Please try again.',
  502: 'The server is unreachable. Please try again shortly.',
  503: 'The service is temporarily unavailable.',
  504: 'The server took too long to respond.',
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Turn {field: "msg"} / ["msg"] / [{field, message}] into readable strings. */
const flattenDetails = (value: unknown): string[] => {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (isRecord(item)) {
        const msg = (item.message ?? item.defaultMessage ?? item.error) as unknown;
        const field = item.field as unknown;
        if (typeof msg === 'string') return [field ? `${String(field)}: ${msg}` : msg];
      }
      return [];
    });
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([k, v]) =>
      typeof v === 'string' ? [`${k}: ${v}`] : flattenDetails(v)
    );
  }
  return [];
};

const cleanString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() && !v.trim().startsWith('<') ? v.trim().slice(0, 300) : undefined;

/**
 * Single place that converts ANY thrown value into text safe to show a user.
 */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (!error) return fallback;

  if (axios.isCancel(error)) return STATUS_FALLBACK[401];

  if (axios.isAxiosError(error)) {
    // No response at all: server down, CORS, offline or timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
      return 'Cannot reach the server. Check your connection and that the backend is running.';
    }

    const { status, data } = error.response;
    const body: LooseBody | string | undefined = data;

    // 403 from Spring is generic ("Access Denied") - a clearer sentence helps users.
    if (status === 403) return STATUS_FALLBACK[403];

    if (typeof body === 'string') return cleanString(body) ?? STATUS_FALLBACK[status] ?? fallback;

    if (isRecord(body)) {
      const details = [
        ...flattenDetails(body.errors),
        ...flattenDetails(body.fieldErrors),
        ...flattenDetails(body.details),
      ];
      const main = cleanString(body.message) ?? cleanString(body.error);
      if (details.length) return [main, ...details].filter(Boolean).join(' - ');
      if (main) return main;
    }
    return STATUS_FALLBACK[status] ?? (status >= 500 ? STATUS_FALLBACK[500] : fallback);
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/**
 * For requests made with responseType: 'blob' (PDF download) the error body
 * arrives as a Blob. Parse it back to JSON so getErrorMessage can read it.
 */
export const unwrapBlobError = async (error: unknown): Promise<unknown> => {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      error.response.data = JSON.parse(text);
    } catch {
      /* leave as-is */
    }
  }
  return error;
};
