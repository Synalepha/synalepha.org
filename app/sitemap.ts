import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const changed = new Date("2026-08-07T00:00:00Z");
  return [
    "",
    "/u/maya",
    "/trust",
    "/status",
    "/safety",
    "/privacy",
    "/community",
    "/terms",
    "/signup",
  ].map((path, index) => ({
    url: `https://synalepha.org${path || "/"}`,
    lastModified: changed,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index === 1 ? 0.8 : 0.6,
  }));
}
