import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/track", "/about", "/faq", "/contact", "/login", "/register"];
  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/services" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
