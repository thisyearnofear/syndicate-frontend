/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enhanced image configuration
  images: {
    domains: [
      "syndicate-lens.vercel.app",
      "localhost",
      "lens.xyz",
      "ipfs.io",
      "arweave.net",
      "cloudflare-ipfs.com",
      "gateway.ipfs.io",
    ],
    // Image optimization settings
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Code splitting and performance optimizations
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "syndicate-lens.vercel.app",
      ],
    },
    // Enable optimizations
    optimizeCss: true,
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "framer-motion",
    ],
  },
  // Turbopack configuration (moved out of experimental as it's now stable)
  turbopack: {
    rules: {
      "*.svg": ["@svgr/webpack"],
    },
  },
  // Ensure TypeScript is properly handled
  typescript: {
    // Don't fail the build on TypeScript errors during development
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  // Properly handle CSS
  sassOptions: {
    includePaths: ["./src"],
  },
  // Ensure proper transpilation of dependencies
  transpilePackages: [
    "@lens-protocol/react",
    "@lens-protocol/client",
    "@lens-chain/sdk",
  ],
  // Webpack configuration for code splitting
  webpack: (config, { isServer }) => {
    // Add code splitting optimizations
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
        },
        commons: {
          name: "commons",
          chunks: "all",
          minChunks: 2,
          priority: 5,
        },
      },
    };

    // Polyfill Node.js modules for browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        path: require.resolve("path-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        zlib: require.resolve("browserify-zlib"),
        os: require.resolve("os-browserify/browser"),
        buffer: require.resolve("buffer/"),
      };

      // Add buffer polyfill
      const webpack = require("webpack");
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
