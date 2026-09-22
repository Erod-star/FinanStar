import { HttpStatus } from '@nestjs/common';

export interface APIResponse<T> {
  data: T;
  token?: string;
  total?: number;
  status_code: HttpStatus;
  timestamp: string;
}

interface FormatToApiResponseArgs<T> {
  data: T;
  status?: HttpStatus;
  total?: number;
  token?: string;
}

export function formatToApiResponse<T>({
  data,
  status,
  total,
  token,
}: FormatToApiResponseArgs<T>): APIResponse<T> {
  const resp: APIResponse<T> = {
    data,
    status_code: status ?? HttpStatus.OK,
    timestamp: new Date().toISOString(),
  };

  if (total) {
    resp.total = total;
  }

  if (token) {
    resp.token = token;
  }

  return resp;
}
