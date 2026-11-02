import { getSupabaseImagePatterns } from "./lib/supabase/urls.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Isolated Preview projects may not have Supabase's paid resizing feature.
    NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS:
      process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS ??
      (process.env.VERCEL_ENV === "preview" ? "false" : "true"),
  },
  images: {
    remotePatterns: [
      ...getSupabaseImagePatterns(process.env.NEXT_PUBLIC_SUPABASE_URL),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
