/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicit cookie configuration
  serverRuntimeConfig: {
    // Config that is only available on the server
    cookieOptions: {
      httpOnly: false, // Allow JavaScript access to cookies
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  },
  publicRuntimeConfig: {
    // Config that is available on both server and client
    csrfCookieName: 'csrf_token',
    csrfHeaderName: 'x-csrf-token',
  },
  // Enhanced image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.lens.xyz",
      },
      {
        protocol: "https",
        hostname: "**.arweave.net",
      },
      {
        protocol: "https",
        hostname: "**.ipfs.dweb.link",
      },
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
    "ui",
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

    // CSRF configuration has been completely disabled as of May 2025
    // These constants are left commented for future reference when implementing a more robust CSRF solution
    const webpack = require("webpack");
    config.plugins.push(
      new webpack.DefinePlugin({
        // CSRF variables disabled to prevent authentication issues
        'process.env.CSRF_DISABLED': JSON.stringify(true),
        // 'process.env.CSRF_COOKIE_HTTP_ONLY': JSON.stringify(false),
        // 'process.env.CSRF_COOKIE_NAME': JSON.stringify('csrf_token'),
        // 'process.env.CSRF_HEADER_NAME': JSON.stringify('x-csrf-token'),
        // 'process.env.CSRF_COOKIE_SAME_SITE': JSON.stringify('lax'),
        // 'process.env.CSRF_COOKIE_PATH': JSON.stringify('/'),
      })
    );

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
  // For Netlify - needed to create routes via redirects
  trailingSlash: false,
  // Allow browser to access environment variables during runtime
  // This is needed for our environment variable debug
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || "mainnet",
    // Backend URLs for authentication - hardcoded for hackathon
    AUTH_BACKEND_URL: "https://site--syndicate-backend--wxs584h67csv.code.run/",
    NEXT_PUBLIC_AUTH_BACKEND_URL:
      process.env.NEXT_PUBLIC_AUTH_BACKEND_URL ||
      "https://site--syndicate-backend--wxs584h67csv.code.run/",
    // For the backend to allow CORS from our frontend
    FRONTEND_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://syndicate-lens.vercel.app",
    // Hardcoded for hackathon purpose only - not for production use
    SHARED_SECRET: "5010728756",
    NEXT_PUBLIC_AUTH_BACKEND_SECRET: "5010728756",
    // Use dedicated RPC providers instead of public endpoints
    NEXT_PUBLIC_LENS_MAINNET_RPC_URL:
      process.env.NEXT_PUBLIC_LENS_MAINNET_RPC_URL ||
      "https://lens-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    NEXT_PUBLIC_LENS_TESTNET_RPC_URL:
      process.env.NEXT_PUBLIC_LENS_TESTNET_RPC_URL ||
      "https://lens-testnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    NEXT_PUBLIC_BASE_CHAIN_RPC_URL:
      process.env.NEXT_PUBLIC_BASE_CHAIN_RPC_URL ||
      "https://base-mainnet.g.alchemy.com/v2/zXTB8midlluEtdL8Gay5bvz5RI-FfsDH",
    // Oku API endpoint for swap functionality
    NEXT_PUBLIC_OKU_API_ENDPOINT:
      process.env.NEXT_PUBLIC_OKU_API_ENDPOINT || "https://api.oku.trade/api",
  },
};

module.exports = nextConfig;
