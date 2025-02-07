// src/lib/converters/videoConverter.ts
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { promises as fs } from "fs"; // Import the promises API
import path from "path";

export async function convertVideo(
  filePath: string,
  outputFormat: string = "mp4"
): Promise<string> {
  try {
    const ffmpeg = new FFmpeg();
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }

    const inputFileName = path.basename(filePath);
    const outputFileName = `${path.basename(filePath, path.extname(filePath))}.${outputFormat}`;
    const outputPath = path.join(path.dirname(filePath), outputFileName); // Output in the same directory

    ffmpeg.FS("writeFile", inputFileName, await fetchFile(filePath));

    // Example conversion command (adjust as needed)
    await ffmpeg.run("-i", inputFileName, outputPath);

    const data = ffmpeg.FS("readFile", outputFileName);
    await fs.writeFile(outputPath, data); // Write to file system

    return outputPath; // Return the path to the converted file
  } catch (error) {
    console.error("Video conversion error:", error);
    throw error; // Re-throw the error for handling in the API route
  }
}
