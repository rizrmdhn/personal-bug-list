export interface Meta {
  code: number;
  status: "success" | "error";
  message: string;
}

export interface ApiResponse<T> {
  meta: Meta;
  data: T;
}

export interface ApiErrorResponse {
  meta: Meta;
}
