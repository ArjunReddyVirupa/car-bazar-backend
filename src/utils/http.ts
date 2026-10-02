export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = 'APP_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function asyncHandler<T>(handler: (req: any, res: any, next: any) => Promise<T>) {
  return (req: any, res: any, next: any) => Promise.resolve(handler(req, res, next)).catch(next);
}
