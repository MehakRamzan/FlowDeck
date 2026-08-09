import type {
  NextFunction,
  Request,
  Response,
} from "express";

export function notFoundHandler(
  request: Request,
  response: Response
): void {
  response.status(404).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  console.error(error);

  const message =
    error instanceof Error
      ? error.message
      : "Internal server error";

  response.status(500).json({
    success: false,
    message,
  });
}