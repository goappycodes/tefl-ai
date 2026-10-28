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

      // Commerce + account journeys stay on WordPress/WooCommerce — forward
      // these paths to the WP host so they don't render empty once Next is the
      // origin for tefl.ai.
      { source: "/cart", destination: `${wpHost}/cart/`, permanent: false },
      { source: "/cart/:path*", destination: `${wpHost}/cart/`, permanent: false },
      { source: "/checkout", destination: `${wpHost}/checkout/`, permanent: false },
      { source: "/checkout/:path*", destination: `${wpHost}/checkout/:path*`, permanent: false },
      { source: "/my-account", destination: `${wpHost}/my-account/`, permanent: false },
      { source: "/my-account/:path*", destination: `${wpHost}/my-account/:path*`, permanent: false },
      { source: "/registration", destination: `${wpHost}/registration/`, permanent: false },
      { source: "/registration-success", destination: `${wpHost}/registration-success/`, permanent: false },
      { source: "/reset-password", destination: `${wpHost}/reset-password/`, permanent: false },

      // Ported WordPress "Redirection" plugin rules (preserve old-URL SEO).
      { source: "/ai-in-tefl", destination: "/ai-in-english-language-teaching", permanent: true },
    ];
  },
};

export default nextConfig;
