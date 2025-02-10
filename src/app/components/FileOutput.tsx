import React from "react";
import { Loader2 } from "lucide-react"; // Import loader icon from lucide-react

interface FileOutputProps {
  fileUrl?: string | null;
  fileName?: string | null;
  errorMessage?: string | null;
  isConverting: boolean;
}

const FileOutput: React.FC<FileOutputProps> = ({
  fileUrl,
  fileName,
  errorMessage,
  isConverting,
}) => {
  if (isConverting) {
    return (
      <div className="mt-6 p-8 max-w-xl mx-auto w-full bg-black bg-opacity-80 rounded-xl shadow-lg border border-blue-500 animate-pulse">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-cyan-400" />
          <p className="text-white text-lg">
            Converting your file, please wait...
          </p>
          <p className="text-sm text-gray-400">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-6 p-4 max-w-xl mx-auto w-full bg-red-900 bg-opacity-80 rounded-xl shadow-lg border border-red-500">
        <div className="text-center text-red-300">
          <p className="font-medium text-lg">Conversion Failed</p>
          <p className="text-sm mt-1">{errorMessage}</p>
          <p className="text-sm mt-2">
            Please try again or use a different file.
          </p>
        </div>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="mt-6 p-6 max-w-xl mx-auto w-full bg-gray-900 bg-opacity-80 rounded-xl shadow-lg border-2 border-dashed border-gray-700">
        <div className="text-center text-gray-400">
          <p className="font-medium text-lg">No File Converted Yet</p>
          <p className="text-sm mt-1">Upload a file to begin conversion</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 max-w-xl mx-auto w-full bg-black bg-opacity-80 rounded-xl shadow-lg border border-green-500">
      <div className="text-center space-y-4">
        <div className="text-green-400 text-lg font-medium">
          ✓ Conversion Complete!
        </div>
        <p className="text-gray-300">Your file is ready for download</p>
        <a
          href={fileUrl}
          download={fileName}
          className="inline-block bg-cyan-500 text-white px-6 py-2 rounded-xl hover:bg-cyan-600 transition-all duration-300 font-medium shadow-md"
        >
          Download {fileName}
        </a>
      </div>
    </div>
  );
};

export default FileOutput;
