import fs from "fs";
import { STAFF_STATE } from "../auth.constants";

export function getStaffCookies(): string {
  const state = JSON.parse(fs.readFileSync(STAFF_STATE, "utf-8"));
  return state.cookies
    .map((cookie: any) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}
