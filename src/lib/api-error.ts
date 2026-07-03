import type { AxiosError } from 'axios';

interface ApiErrorPayload {
  message?: string;
  detail?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorPayload>;
  const data = axiosError.response?.data;

  if (data?.errors) {
    const firstError = Object.values(data.errors).flat()[0];
    if (firstError) {
      return firstError;
    }
  }

  return data?.message ?? data?.detail ?? data?.title ?? fallback;
};
