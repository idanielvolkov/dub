import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://detz.fun",
      lastModified: new Date(),
    },
  ];
}
