import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";

// Converter imports
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
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/tiff",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  uploadDir: path.join(process.cwd(), "tmp/uploads"),
};

// Ensure upload directory exists
async function ensureUploadDirectory() {
  try {
    await fs.mkdir(CONVERSION_CONFIG.uploadDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
  }
}

// Process and validate uploaded file
async function processUploadedFile(buffer: Buffer, originalFilename: string) {
  const detectedType = await fileTypeFromBuffer(buffer);

  if (
    !detectedType ||
    !CONVERSION_CONFIG.allowedMimeTypes.includes(detectedType.mime)
  ) {
    throw new Error("Invalid file type");
  }

  const uniqueFilename = `${uuidv4()}${path.extname(originalFilename)}`;
  const filePath = path.join(CONVERSION_CONFIG.uploadDir, uniqueFilename);

  await fs.writeFile(filePath, buffer);

  return { filePath, fileType: detectedType };
}

// Conversion handler
async function convertFile(filePath: string, mimeType: string, format: string) {
  const converters: Record<
    string,
    (path: string, format: string) => Promise<string>
  > = {
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
      return await converter(filePath, format);
    }
  }

  throw new Error("No suitable converter found");
}

// Cleanup function
async function cleanupFiles(...filePaths: string[]) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Cleanup error for ${filePath}:`, error);
    }
  }
}

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({ error: "No request body" }, { status: 400 });
  }

  let originalFilePath: string | undefined;
  let convertedFilePath: string | undefined;

  try {
    await ensureUploadDirectory();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const format = formData.get("format") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > CONVERSION_CONFIG.maxFileSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { filePath, fileType } = await processUploadedFile(buffer, file.name);
    originalFilePath = filePath;

    convertedFilePath = await convertFile(
      filePath,
      fileType.mime,
      format || ""
    );
    const filename = path.basename(convertedFilePath);
    const fileStream = await fs.readFile(convertedFilePath);

    // Schedule cleanup
    setTimeout(() => {
      cleanupFiles(originalFilePath!, convertedFilePath!).catch((error) =>
        console.error("Delayed cleanup error:", error)
      );
    }, 1000);

    return new NextResponse(fileStream, {
      status: 200,
      headers: {
        "Content-Type": fileType.mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    // Immediate cleanup on error
    if (originalFilePath || convertedFilePath) {
      await cleanupFiles(originalFilePath!, convertedFilePath!).catch((error) =>
        console.error("Error cleanup error:", error)
      );
    }

    console.error("Conversion Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Conversion failed" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
