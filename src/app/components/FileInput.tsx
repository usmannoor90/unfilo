import { useDropzone } from "react-dropzone";
import { BarLoader } from "react-spinners"; // Import the spinner

interface FileInputProps {
  onFileDropped: (file: File) => void;
  isConverting: boolean; // Add a prop for the loading state
  errorMessage: string | null; // Add a prop for error messages
}

const FileInput: React.FC<FileInputProps> = ({
  onFileDropped,
  isConverting,
  errorMessage,
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      onFileDropped(acceptedFiles[0]);
    },
    accept: {
      // Define accepted file types (optional, but recommended)
      "video/*": [],
      "image/*": [],
      "application/pdf": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [], // DOCX
    },
    maxFiles: 1, // Limit to one file
    maxSize: 25 * 1024 * 1024, // 25 MB (match your API limit)
  });

  return (
    <div className="border-dashed border-2 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition duration-300">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isConverting && (
          <BarLoader color="#3b82f6" width={50} height={50} />
        )}{" "}
        {/* Show spinner if converting */}
        {!isConverting && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              Drag &apos;n&apos; drop a file here, or click to select a file
            </p>
            <p className="text-gray-500 text-sm mt-2">
              (Video, Image, PDF, DOCX supported)
            </p>
          </>
        )}
      </div>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}{" "}
      {/* Display error */}
    </div>
  );
};

export default FileInput;
