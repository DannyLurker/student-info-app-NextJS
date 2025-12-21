import AppError from "./AppError";

export { default as AppError } from "./AppError";
export { handleError } from "./handleError";

// Quick helpers
export const notFound = (msg: string | "Not found") => new AppError(msg, 404);
export const badRequest = (msg: string | "Bad request") =>
  new AppError(msg, 400);
export const unauthorized = (msg: string | "Unauthorized") =>
  new AppError(msg, 401);
export const tooManyRequest = (msg: string | "Too many requests") =>
  new AppError(msg, 429);
