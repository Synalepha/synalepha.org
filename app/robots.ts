import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/u/maya",
        "/trust",
        "/status",
        "/safety",
        "/privacy",
        "/community",
        "/terms",
      ],
      disallow: [
        "/account",
        "/admin",
        "/auth",
        "/discover",
        "/friends",
        "/home",
        "/login",
        "/messages",
        "/profile",
        "/reset-password",
        "/settings",
      ],
    },
    sitemap: "https://synalepha.org/sitemap.xml",
    host: "https://synalepha.org",
  };
}
