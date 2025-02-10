import ExcelJS from "exceljs";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Converts spreadsheet files between various formats
 * @param inputPath Path to the input spreadsheet file
 * @param targetFormat Target spreadsheet format (default: xlsx)
 * @returns Promise resolving to the path of the converted file
 */
export async function convertSpreadsheet(
  inputPath: string,
  format: string,
  targetFormat: "xlsx" | "csv" | "pdf" = "xlsx"
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const outputFilename = `${uuidv4()}.${targetFormat}`;
  const outputPath = path.join(path.dirname(inputPath), outputFilename);

  try {
    // Load the input workbook
    await workbook.xlsx.readFile(inputPath);

    switch (targetFormat) {
      case "xlsx":
        await workbook.xlsx.writeFile(outputPath);
        break;
      case "csv":
        // Export first worksheet to CSV
        const worksheet = workbook.worksheets[0];
        const csvData = await worksheet.cvs;
        await fs.writeFile(outputPath, csvData);
        break;
      case "pdf":
        // Note: PDF export might require additional library
        await workbook.xlsx.writeFile(outputPath);
        // You might want to use a PDF conversion library here
        break;
      default:
        throw new Error("Unsupported format");
    }

    // Optional: Delete original file
    await fs.unlink(inputPath);

    return outputPath;
  } catch (error) {
    console.error("Spreadsheet conversion error:", error);
    throw error;
  }
}
