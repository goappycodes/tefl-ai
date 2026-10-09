import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Trim client JS: rewrite barrel imports to per-module imports so only the
    // icons/animations actually used are bundled (helps TBT/LCP).
    optimizePackageImports: ["framer-motion", "lucide-react"],
    // Inline the page's CSS into the HTML instead of a render-blocking
    // <link>. Removes the HTML->CSS critical-path round-trip (~633ms on
    // slow 4G) that was delaying first paint / LCP.
    inlineCss: true,
  },
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
