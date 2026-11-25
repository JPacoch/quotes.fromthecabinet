import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/og": [
      "./node_modules/@fontsource/geist/files/geist-latin-400-normal.woff",
      "./node_modules/@fontsource/geist/files/geist-latin-ext-400-normal.woff",
      "./node_modules/@fontsource/geist/files/geist-latin-600-normal.woff",
      "./node_modules/@fontsource/geist/files/geist-latin-ext-600-normal.woff",
      "./node_modules/@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff",
      "./node_modules/@fontsource/geist-mono/files/geist-mono-latin-ext-400-normal.woff",
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.quotes.fromthecabinet.com",
          },
        ],
        destination: "https://quotes.fromthecabinet.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
