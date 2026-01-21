export const SORTBY = ["name", "status"] as const;
export type SortBy = (typeof SORTBY)[number];

export const SORTORDER = ["asc", "desc"] as const;
export type SortOrder = (typeof SORTORDER)[number];
