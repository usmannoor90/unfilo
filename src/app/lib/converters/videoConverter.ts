import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export async function convertVideo(file: File, outputFormat = "mp4") {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load(); // Load FFmpeg.wasm

  const inputFileName = file.name;
  const outputFileName = `converted.${outputFormat}`;

  // Write file to FFmpeg's in-memory filesystem
  await ffmpeg.writeFile(inputFileName, await fetchFile(file));

  // Execute FFmpeg command for conversion
  await ffmpeg.exec(["-i", inputFileName, outputFileName]);

  // Read the converted file
  const data = await ffmpeg.readFile(outputFileName);

  // Create a Blob URL for download
  return new Blob([data], { type: `video/${outputFormat}` });
}
