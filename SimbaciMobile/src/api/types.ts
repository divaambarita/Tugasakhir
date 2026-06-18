export type ApiOk<T> = {
  status: number;
  success: true;
  data: T;
};

export type ApiFail = {
  status: number;
  success: false;
  message?: string;
  errors?: string[];
};

export type ApiResponse<T> = ApiOk<T> | ApiFail;
