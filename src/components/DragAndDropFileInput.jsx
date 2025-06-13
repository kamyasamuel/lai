import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const DragAndDropFileInput = ({ onFileSelect, acceptedFileTypes = ".pdf,.docx,.doc", className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${
        isDragging 
          ? 'border-[#8c00cc] bg-[rgba(140,0,204,0.05)]' 
          : 'border-[#333] hover:border-[--tw-bg-color] hover:bg-[rgba(140,0,204,0.02)]'
      } ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current && fileInputRef.current.click()}
    >
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInput}
        accept={acceptedFileTypes}
      />
      <Upload className="mx-auto mb-4 text-[#8c00cc]" size={42} />
      <h4 className="text-lg font-medium mb-2">
        {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
      </h4>
      <p className="text-sm text-gray-400">
        or click to browse from your computer
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Supported formats: {acceptedFileTypes.replace(/\./g, '').replace(/,/g, ', ')}
      </p>
    </div>
  );
};

export default DragAndDropFileInput;