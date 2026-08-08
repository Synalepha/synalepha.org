import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Roomtone",
    short_name: "Roomtone",
    description:
      "Expressive personal pages, intentional friendships, chronological updates.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4e8d2",
    theme_color: "#171522",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
