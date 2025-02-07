import React from 'react';

interface FileOutputProps {
  convertedFileUrl: string | null;
  originalFilename: string | null;
}

const FileOutput: React.FC<FileOutputProps> = ({ convertedFileUrl, originalFilename }) => {
  if (!convertedFileUrl) {
    return null;
  }

  const handleDownload = () => {
    if (convertedFileUrl && originalFilename) {
      const a = document.createElement('a');
      a.href = convertedFileUrl;
      a.download = originalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(convertedFileUrl); // Release the object URL
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-medium mb-2">Converted File:</h2>
      <button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Download {originalFilename}
      </button>

    </div>
  );
};

export default FileOutput;
