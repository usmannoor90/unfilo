// src/lib/converters/docxConverter.ts
import mammoth from "mammoth";
import { promises as fs } from "fs";
import path from "path";

export async function convertDocx(
  filePath: string,
  outputFormat: string = "html"
): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value; // The generated HTML

    const outputFileName = `${path.basename(filePath, path.extname(filePath))}.${outputFormat}`;
    const outputPath = path.join(path.dirname(filePath), outputFileName);

    await fs.writeFile(outputPath, html);
    return outputPath;
  } catch (error) {
    console.error("DOCX conversion error:", error);
    throw error;
  }
}
