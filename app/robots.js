import { SITE_URL } from "../lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/about", "/contact", "/product/"],
        disallow: [
          "/admin",
          "/admin/",
          "/auth",
          "/auth/",
          "/customer",
          "/customer/",
          "/cart",
          "/api",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
