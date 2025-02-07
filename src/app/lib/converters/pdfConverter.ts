// src/lib/converters/pdfConverter.ts
import { PDFDocument } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";

export async function convertPdf(filePath: string): Promise<string> {
  // Example: Just optimize
  try {
    const pdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // You can add PDF manipulation logic here if needed (e.g., optimize, add text)

    const outputFileName = `${path.basename(filePath, path.extname(filePath))}_optimized.pdf`; // Example: Add _optimized
    const outputPath = path.join(path.dirname(filePath), outputFileName);
    const modifiedPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, modifiedPdfBytes);
    return outputPath;
  } catch (error) {
    console.error("PDF conversion/manipulation error:", error);
    throw error;
  }
}
