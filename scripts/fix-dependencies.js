// fix-dependencies.js
const fs = require("fs");
const path = require("path");

// Function to update package.json
function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Replace canary versions with specific versions
  if (packageJson.dependencies["@lens-protocol/metadata"] === "canary") {
    packageJson.dependencies["@lens-protocol/metadata"] = "^2.0.0";
  }

  if (packageJson.dependencies["@lens-protocol/client"] === "canary") {
    packageJson.dependencies["@lens-protocol/client"] = "^2.0.0";
  }

  if (packageJson.dependencies["@lens-protocol/react"] === "canary") {
    packageJson.dependencies["@lens-protocol/react"] = "^2.3.2";
  }

  if (packageJson.dependencies["@lens-chain/sdk"] === "canary") {
    packageJson.dependencies["@lens-chain/sdk"] = "^1.0.3";
  }

  // Add resolutions if not present
  if (!packageJson.resolutions) {
    packageJson.resolutions = {
      "styled-components": "^5.3.11",
    };
  }

  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(
    "Updated package.json with specific versions instead of canary tags"
  );
}

// Run the update
updatePackageJson();
