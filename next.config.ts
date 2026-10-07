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
    const wpHost = process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL || "https://tefl.ai";
    return [
      // Preserve legacy WordPress redirects (see REBUILD-BLUEPRINT.md §4)
      { source: "/shop", destination: "/courses", permanent: true },
      { source: "/profile", destination: "/my-account", permanent: true },
      { source: "/home", destination: "/", permanent: false },
      // LearnDash course pages stay on WordPress — forward course detail URLs
      // to the WP/commerce host (swap via NEXT_PUBLIC_CHECKOUT_BASE_URL).
      { source: "/courses/:slug", destination: `${wpHost}/courses/:slug/`, permanent: false },
    ];
  },
};

export default nextConfig;
