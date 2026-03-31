import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/create-account",
        "/forgot-password",
        "/reset-password",
        "/sign-in",
      ],
    },
  };
}
