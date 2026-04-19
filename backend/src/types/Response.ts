interface Response<T = unknown> {
  message: string;
  success: boolean;
  data: T | null;
  error: object | null;
  status: number;
}

export default Response;
