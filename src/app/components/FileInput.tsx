"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FileInputProps {
  onFileUpload: (file: File, type?: string) => void;
}

const CONVERSION_OPTIONS: Record<string, string[]> = {
  image: ["jpeg", "png", "gif", "webp", "tiff"],
  video: ["mp4", "webm", "mov", "avi"],
  audio: ["mp3", "wav", "ogg"],
  document: ["pdf", "docx", "xlsx"],
};

const FileInput: React.FC<FileInputProps> = ({ onFileUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [conversionType, setConversionType] = useState<string>("");

  const simulateUpload = useCallback(
    (uploadedFile: File, type: string) => {
      setUploading(true);
      setProgress(0);

      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 10;
        setProgress(progressValue);

        if (progressValue >= 100) {
          clearInterval(interval);
          setUploading(false);
          onFileUpload(uploadedFile, type);
        }
      }, 300);
    },
    [onFileUpload]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setConversionType("");
    setProgress(0);
  }, []);

  const handleConversionTypeChange = (type: string) => {
    setConversionType(type);
    if (file) {
      simulateUpload(file, type);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".mov", ".avi"],
      "image/*": [".jpeg", ".png", ".gif", ".webp", ".tiff"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "audio/*": [".mp3", ".wav", ".ogg"],
    },
  });

  const getConversionOptions = () => {
    if (!file) return [];
    const fileType = file.type.split("/")[0];
    return CONVERSION_OPTIONS[fileType] || [];
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps({ onDrag: undefined })}
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 p-6 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-900 shadow-xl shadow-blue-500/50 w-full"
      >
        <input {...getInputProps()} />
        <UploadCloud className="text-blue-400 w-12 h-12 mb-2 animate-pulse" />
        {file ? (
          <>
            <p className="text-blue-300 font-medium">{file.name}</p>
            {getConversionOptions().length > 0 && (
              <div className="mt-3 w-full">
                <label className="text-blue-400 text-sm mb-1 block">
                  Convert To:
                </label>
                <Select
                  onValueChange={handleConversionTypeChange}
                  value={conversionType}
                >
                  <SelectTrigger className="w-full bg-gray-800 border border-blue-500 text-blue-300">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {getConversionOptions().map((format) => (
                      <SelectItem
                        key={format}
                        value={format}
                        className="text-blue-300"
                      >
                        {format.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        ) : (
          <p className="text-blue-400">
            Drag & drop a file here, or click to select one
          </p>
        )}
      </div>
      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full mt-3"
        >
          <Progress
            value={progress}
            className="w-full h-2 bg-blue-500 border border-blue-500"
          />
        </motion.div>
      )}
    </div>
  );
};

export default FileInput;
