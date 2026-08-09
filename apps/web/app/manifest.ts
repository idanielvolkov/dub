import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Detz VPN",
    short_name: "Detz",
    description: "VPN business operations and Remnawave management",
    start_url: "/",
    display: "standalone",
    background_color: "#e5e5e5",
    theme_color: "#e1e1e1",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
