// src/lib/converters/imageConverter.ts
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

export async function convertImage(
  filePath: string,
  outputFormat: string = "png"
): Promise<string> {
  try {
    const outputFileName = `${path.basename(filePath, path.extname(filePath))}.${outputFormat}`;
    const outputPath = path.join(path.dirname(filePath), outputFileName);

    let image = sharp(filePath);

    switch (outputFormat) {
      case "jpeg":
      case "jpg":
        image = image.jpeg();
        break;
      case "webp":
        image = image.webp();
        break;
      case "gif": // Example: Convert to GIF (requires more options)
        image = image.gif();
        break;
      default:
        image = image.png(); // Default to PNG
    }

    const data = await image.toBuffer();
    await fs.writeFile(outputPath, data);

    return outputPath;
  } catch (error) {
    console.error("Image conversion error:", error);
    throw error;
  }
}
