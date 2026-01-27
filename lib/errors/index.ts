import AppError from "./AppError";

export { default as AppError } from "./AppError";
export { handleError } from "./handleError";

// Quick helpers
export const notFound = (msg: string | "Not found") => new AppError(msg, 404);
export const badRequest = (msg: string | "Bad request") =>
  new AppError(msg, 400);
export const unauthorized = (msg: string | "Unauthorized") =>
  new AppError(msg, 401);
export const forbidden = (msg: string | "Forbidden") => new AppError(msg, 403);
export const tooManyRequest = (msg: string | "Too many requests") =>
  new AppError(msg, 429);
export const internalServerError = (
  msg: string | "Something went wrong. Try it again later",
) => new AppError(msg, 500);
