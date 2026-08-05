import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dub",
    short_name: "Dub",
    description: "Dub - The Modern Link Attribution Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#e5e5e5",
    theme_color: "#e1e1e1",
    icons: [
      {
        src: "https://assets.dub.co/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "https://assets.dub.co/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
