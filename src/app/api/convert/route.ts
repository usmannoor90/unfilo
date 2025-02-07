import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { file-type as fileType } from "file-type";

// Converter imports
import { convertVideo } from "@/app/lib/converters/videoConverter";
import { convertImage } from "@/app/lib/converters/imageConverter";
import { convertPdf } from "@/app/lib/converters/pdfConverter";
import { convertDocx } from "@/app/lib/converters/docxConverter";
import { convertAudio } from "@/app/lib/converters/audioConverter";
import { convertSpreadsheet } from "@/app/lib/converters/spreadsheetConverter";

// Configuration types
interface ConversionConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadDir: string;
}

// Centralized configuration
const CONVERSION_CONFIG: ConversionConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    // Video types
    "video/mp4",
    "video/webm",
    "video/mov",
    "video/avi",
    // Image types
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/tiff",
    // Document types
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Audio types
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    // Spreadsheet types
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  uploadDir: path.join(process.cwd(), "uploads"),
};

// Ensure upload directory exists
async function ensureUploadDirectory() {
  try {
    await fs.mkdir(CONVERSION_CONFIG.uploadDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
  }
}

// Validate and process file
async function processUploadedFile(file: formidable.File) {
  // Detect file type
  const detectedType = await fileType.fromFile(file.filepath);

  if (
    !detectedType ||
    !CONVERSION_CONFIG.allowedMimeTypes.includes(detectedType.mime)
  ) {
    await fs.unlink(file.filepath);
    throw new Error("Invalid file type");
  }

  // Generate unique filename
  const uniqueFilename = `${uuidv4()}${path.extname(file.originalFilename || "")}`;
  const newFilePath = path.join(CONVERSION_CONFIG.uploadDir, uniqueFilename);

  await fs.rename(file.filepath, newFilePath);

  return { filePath: newFilePath, fileType: detectedType };
}

// Conversion handler
async function convertFile(filePath: string, mimeType: string) {
  const converters = {
    "video/": convertVideo,
    "image/": convertImage,
    "application/pdf": convertPdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      convertDocx,
    "audio/": convertAudio,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      convertSpreadsheet,
  };

  for (const [prefix, converter] of Object.entries(converters)) {
    if (mimeType.startsWith(prefix) || mimeType === prefix) {
      return await converter(filePath);
    }
  }

  throw new Error("No suitable converter found");
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  await ensureUploadDirectory();

  try {
    const form = formidable({
      maxFileSize: CONVERSION_CONFIG.maxFileSize,
      uploadDir: CONVERSION_CONFIG.uploadDir,
    });

    const { files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    if (!files.file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const file = (files.file as formidable.File[])[0];
    const { filePath, fileType: detectedType } =
      await processUploadedFile(file);

    const convertedFilePath = await convertFile(filePath, detectedType.mime);

    // Stream converted file
    const filename = path.basename(convertedFilePath);
    const fileStream = await fs.readFile(convertedFilePath);

    return new NextResponse(fileStream, {
      status: 200,
      headers: {
        "Content-Type": detectedType.mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Conversion Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Conversion failed",
      },
      { status: 500 }
    );
  }
}
