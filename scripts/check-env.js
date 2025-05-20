// check-env.js
// This script checks if critical environment variables are available during build

console.log("🔍 Checking critical environment variables at build time:");

const criticalVars = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_ENVIRONMENT",
  "NEXT_PUBLIC_LENS_MAINNET_RPC_URL",
  "NEXT_PUBLIC_LENS_TESTNET_RPC_URL",
  "NEXT_PUBLIC_BASE_CHAIN_RPC_URL",
  "AUTH_BACKEND_URL",
  "NEXT_PUBLIC_AUTH_BACKEND_URL",
  "SHARED_SECRET",
  "NEXT_PUBLIC_AUTH_BACKEND_SECRET",
];

let missingVars = false;

criticalVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ Missing ${varName}`);
    missingVars = true;
  } else {
    // Hide full values for security in logs
    const displayValue =
      varName.includes("SECRET") || varName.includes("KEY")
        ? "[HIDDEN]"
        : value.substring(0, 25) + (value.length > 25 ? "..." : "");
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

if (missingVars) {
  console.warn(
    "⚠️  Some critical environment variables are missing, but continuing build..."
  );
} else {
  console.log("✅ All critical environment variables are present");
}

// Don't exit with error to avoid blocking builds, just warn
console.log("📦 Continuing with build process");
