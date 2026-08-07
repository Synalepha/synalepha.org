import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LoudPage",
    short_name: "LoudPage",
    description:
      "Expressive personal pages, intentional friendships, chronological updates.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#0b0d20",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
