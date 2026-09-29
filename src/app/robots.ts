import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'espace d'administration contient des données personnelles de
      // prospects : il ne doit jamais être indexé.
      disallow: ["/admin", "/api"],
    },
  };
}
