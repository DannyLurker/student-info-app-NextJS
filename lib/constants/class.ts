export const GRADES = ["TENTH", "ELEVENTH", "TWELFTH"] as const;
export type Grade = (typeof GRADES)[number];

export const MAJORS = ["ACCOUNTING", "SOFTWARE_ENGINEERING"] as const;
export type Major = (typeof MAJORS)[number];
