// fix-dependencies.js
const fs = require("fs");
const path = require("path");

try {
  // Function to update package.json
  function updatePackageJson() {
    const packageJsonPath = path.join(process.cwd(), "package.json");

    // Check if package.json exists
    if (!fs.existsSync(packageJsonPath)) {
      console.log("package.json not found at:", packageJsonPath);
      return;
    }

    // Read and parse package.json
    let packageJson;
    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
      packageJson = JSON.parse(packageJsonContent);
    } catch (error) {
      console.error("Error reading or parsing package.json:", error);
      return;
    }

    // Check if dependencies exist
    if (!packageJson.dependencies) {
      console.log("No dependencies found in package.json");
      return;
    }

    let changed = false;

    // Replace canary versions with specific versions
    const lensPackages = [
      { name: "@lens-protocol/metadata", version: "^2.0.0" },
      { name: "@lens-protocol/client", version: "^2.0.0" },
      { name: "@lens-protocol/react", version: "^2.3.2" },
      { name: "@lens-chain/sdk", version: "^1.0.3" },
    ];

    lensPackages.forEach((pkg) => {
      if (packageJson.dependencies[pkg.name] === "canary") {
        packageJson.dependencies[pkg.name] = pkg.version;
        changed = true;
        console.log(`Updated ${pkg.name} from 'canary' to ${pkg.version}`);
      }
    });

    // Add resolutions if not present
    if (!packageJson.resolutions) {
      packageJson.resolutions = {
        "styled-components": "^5.3.11",
      };
      changed = true;
      console.log("Added resolutions for styled-components");
    }

    // Only write if changes were made
    if (changed) {
      try {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log("Successfully updated package.json");
      } catch (error) {
        console.error("Error writing package.json:", error);
      }
    } else {
      console.log("No changes needed in package.json");
    }
  }

  // Run the update
  updatePackageJson();
} catch (error) {
  console.error("Unexpected error in fix-dependencies.js:", error);
  // Exit with success to not block the build
  process.exit(0);
}
