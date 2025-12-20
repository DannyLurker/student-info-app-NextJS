import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { notFound } from "../errors";
import hbs from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type Replacements = {
  schoolName: string;
  username: string;
  userEmail: string;
  otpCode: string;
  currentYear: Date | number;
};

export const loadTemplate = (
  templateName: string,
  replacements: Replacements
) => {
  const templatePath = path.join(__dirname, templateName);

  if (!fs.existsSync(templatePath)) {
    throw notFound(`Template file not found: ${templatePath}`);
  }

  const source = fs.readFileSync(templatePath, "utf-8");

  const template = hbs.compile(source);

  return template(replacements);
};
