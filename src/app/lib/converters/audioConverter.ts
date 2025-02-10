import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Converts audio files to different formats
 * @param inputPath Path to the input audio file
 * @param targetFormat Target audio format (default: mp3)
 * @returns Promise resolving to the path of the converted file
 */
export async function convertAudio(
  inputPath: string,
  format: string,
  targetFormat: "mp3" | "wav" | "ogg" = "mp3"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFilename = `${uuidv4()}.${targetFormat}`;
    const outputPath = path.join(path.dirname(inputPath), outputFilename);

    ffmpeg(inputPath)
      .toFormat(targetFormat)
      .on("end", () => {
        // Optional: Delete original file if needed
        fs.unlink(inputPath).catch(console.error);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("Audio conversion error:", err);
        reject(err);
      })
      .save(outputPath);
  });
}
