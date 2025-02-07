"use client"; // This is a client component
import { useState } from "react";
import FileInput from "@/app/components/FileInput";
import FileOutput from "@/app/components/FileOutput";

const HomePage: React.FC = () => {
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false); // State for loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error

  const handleFileDrop = async (file: File) => {
    setIsConverting(true); // Set loading to true
    setErrorMessage(null); // Clear any previous errors

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "File conversion failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setConvertedFileUrl(url);
      setOriginalFilename(file.name);
    } catch (error) {
      console.error("Error uploading and converting:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "there is something wrong with the server."
      ); // Set error message to display
    } finally {
      setIsConverting(false); // Set loading to false
    }
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto p-4">
        <FileInput
          onFileDropped={handleFileDrop}
          isConverting={isConverting}
          errorMessage={errorMessage}
        />
        <FileOutput
          convertedFileUrl={convertedFileUrl}
          originalFilename={originalFilename}
        />
      </div>
    </div>
  );
};

export default HomePage;
