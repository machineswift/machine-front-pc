export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  timestamp: number;
  traceId: string;
  data: T;
}