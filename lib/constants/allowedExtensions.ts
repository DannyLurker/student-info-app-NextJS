export const ALLOWED_EXTENSIONS = ["xlsx", "xls"] as const;
export type AllowedExtensions = (typeof ALLOWED_EXTENSIONS)[number];
