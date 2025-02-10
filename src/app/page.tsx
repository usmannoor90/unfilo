"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FileInput from "@/app/components/FileInput";
import FileOutput from "@/app/components/FileOutput";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

const HomePage: React.FC = () => {
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileDrop = async (file: File, type?: string) => {
    if (!type) {
      setErrorMessage("File type is required.");
      return;
    }
    setIsConverting(true);
    setErrorMessage(null);

    const videoExtensions = ["mp4", "webm", "mov", "avi"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension && videoExtensions.includes(fileExtension)) {
      // Handle video conversion in the browser
      try {
        if (!ffmpeg.loaded) {
          await ffmpeg.load(); // Load FFmpeg
        }

        const inputFileName = file.name;
        const outputFileName = inputFileName.replace(/\.\w+$/, `.${type}`);

        // Write file to FFmpeg's in-memory system
        await ffmpeg.writeFile(inputFileName, await fetchFile(file));

        // Convert video to the selected type
        await ffmpeg.exec(["-i", inputFileName, outputFileName]);

        // Read the output file
        const data = await ffmpeg.readFile(outputFileName);
        const blob = new Blob([data], { type: `video/${type}` });

        // Generate downloadable URL
        if (convertedFileUrl) {
          URL.revokeObjectURL(convertedFileUrl);
        }
        const url = URL.createObjectURL(blob);

        setConvertedFileUrl(url);
        setOriginalFilename(outputFileName);
      } catch (error) {
        console.error("Error converting video:", error);
        setErrorMessage("Video conversion failed. Please try again.");
      } finally {
        setIsConverting(false);
      }
    } else {
      // Send other files to API with format selection
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", type); // Pass the selected format to backend

      try {
        const response = await fetch("/api/convert", {
          method: "POST",
          headers: {},
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "File conversion failed");
        }

        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const downloadFilename = filenameMatch
          ? filenameMatch[1]
          : file.name.replace(/\.\w+$/, `.${type}`);

        const blob = await response.blob();
        if (convertedFileUrl) {
          URL.revokeObjectURL(convertedFileUrl);
        }
        const url = URL.createObjectURL(blob);

        setConvertedFileUrl(url);
        setOriginalFilename(downloadFilename);
      } catch (error) {
        console.error("Error uploading and converting:", error);
        setErrorMessage("There is something wrong with the server.");
      } finally {
        setIsConverting(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (convertedFileUrl) {
        URL.revokeObjectURL(convertedFileUrl);
      }
    };
  }, [convertedFileUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className=" flex  justify-center "
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-[1000px] w-full mx-auto  bg-opacity-80 shadow-2xl rounded-3xl p-8 backdrop-blur-md "
      >
        {/* Futuristic Neon Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="text-3xl text-center font-extrabold text-blue-400 drop-shadow-md mb-6"
        >
          ⚡ unFilo File Converter
        </motion.h1>

        {/* File Input Component with Motion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
        >
          <FileInput onFileUpload={handleFileDrop} />
        </motion.div>

        {/* File Output Component with Motion */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
        >
          <FileOutput
            fileUrl={convertedFileUrl}
            fileName={originalFilename}
            isConverting={isConverting}
            errorMessage={errorMessage}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
