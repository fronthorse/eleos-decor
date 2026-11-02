import { getSupabaseImagePatterns } from "./lib/supabase/urls.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
