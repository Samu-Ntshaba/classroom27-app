import { AxiosError } from 'axios';

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
  if (!error) return fallback;
  if ((error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<any>;
    const data = axiosError.response?.data as any;
    return data?.message ?? data?.error ?? axiosError.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};
