/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qexvohhfowswnryqugvr.supabase.co",
      },
    ],
  },
};

export default nextConfig;
