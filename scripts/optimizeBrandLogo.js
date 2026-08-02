import fs from "node:fs/promises";
import path from "node:path";

import {
  fileURLToPath,
} from "node:url";

import sharp from "sharp";

const currentFile =
  fileURLToPath(
    import.meta.url
  );

const currentDirectory =
  path.dirname(currentFile);

const frontendDirectory =
  path.resolve(
    currentDirectory,
    ".."
  );

const sourceLogo = path.join(
  frontendDirectory,
  "src",
  "assets",
  "images",
  "hhs-logo.png"
);

const optimizedLogo = path.join(
  frontendDirectory,
  "src",
  "assets",
  "images",
  "hhs-logo-optimized.webp"
);

const optimizeLogo = async () => {
  try {
    await fs.access(sourceLogo);

    const sourceMetadata =
      await sharp(
        sourceLogo
      ).metadata();

    const outputInformation =
      await sharp(sourceLogo)
        .resize({
          width: 640,
          height: 640,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 90,
          alphaQuality: 100,
          effort: 6,
          smartSubsample: true,
        })
        .toFile(
          optimizedLogo
        );

    console.log(
      "HHS logo optimized successfully."
    );

    console.log(
      `Original dimensions: ${sourceMetadata.width}x${sourceMetadata.height}`
    );

    console.log(
      `Optimized dimensions: ${outputInformation.width}x${outputInformation.height}`
    );

    console.log(
      `Optimized size: ${(
        outputInformation.size /
        1024
      ).toFixed(2)} KB`
    );

    console.log(
      `Saved to: ${optimizedLogo}`
    );
  } catch (error) {
    console.error(
      "Unable to optimize HHS logo:",
      error.message
    );

    process.exitCode = 1;
  }
};

optimizeLogo();