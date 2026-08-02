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

const outputDirectory = path.join(
  frontendDirectory,
  "public",
  "pwa"
);

const createIcon = async ({
  size,
  filename,
  paddingPercentage,
}) => {
  const padding = Math.round(
    size * paddingPercentage
  );

  const logoSize =
    size - padding * 2;

  const resizedLogo =
    await sharp(sourceLogo)
      .resize({
        width: logoSize,
        height: logoSize,
        fit: "contain",
      })
      .png()
      .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,

      background: {
        r: 7,
        g: 24,
        b: 39,
        alpha: 1,
      },
    },
  })
    .composite([
      {
        input: resizedLogo,
        gravity: "center",
      },
    ])
    .png()
    .toFile(
      path.join(
        outputDirectory,
        filename
      )
    );

  console.log(
    `Created ${filename}`
  );
};

const generateIcons = async () => {
  try {
    await fs.access(sourceLogo);

    await fs.mkdir(
      outputDirectory,
      {
        recursive: true,
      }
    );

    await createIcon({
      size: 64,
      filename: "favicon-64.png",
      paddingPercentage: 0.08,
    });

    await createIcon({
      size: 180,
      filename:
        "apple-touch-icon.png",
      paddingPercentage: 0.08,
    });

    await createIcon({
      size: 192,
      filename: "icon-192.png",
      paddingPercentage: 0.08,
    });

    await createIcon({
      size: 512,
      filename: "icon-512.png",
      paddingPercentage: 0.08,
    });

    await createIcon({
      size: 512,
      filename:
        "icon-maskable-512.png",
      paddingPercentage: 0.22,
    });

    console.log(
      "All HHS PWA icons generated successfully."
    );
  } catch (error) {
    console.error(
      "Unable to generate PWA icons:",
      error.message
    );

    process.exitCode = 1;
  }
};

generateIcons();