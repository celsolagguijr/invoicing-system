import { AxiosError } from "axios";

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  error: Record<string, any> | null;
  data: T | null;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  error: Record<string, any> | null;
}

export type ApiAxiosError<T = any> = AxiosError<ApiErrorResponse, T>;
