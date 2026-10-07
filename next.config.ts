import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tefl.ai", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "**.tefl.ai", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "secure.gravatar.com" },
      { protocol: "https", hostname: "i0.wp.com" },
    ],
  },
  async redirects() {
    return [
      // Preserve legacy WordPress redirects (see REBUILD-BLUEPRINT.md §4)
      { source: "/shop", destination: "/courses", permanent: true },
      { source: "/profile", destination: "/my-account", permanent: true },
      { source: "/home", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
