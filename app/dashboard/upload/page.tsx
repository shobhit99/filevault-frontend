'use client';

import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { filesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const response = await filesApi.uploadFile(file);
        if (response.success) {
          setUploadedFiles(prev => [...prev, file.name]);
          toast.success(`${file.name} uploaded successfully`);
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Upload Files</h1>
        <p className="text-muted-foreground">Drag and drop files or click to select</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/20'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 p-6 rounded-full mb-4">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {dragOver ? 'Drop files here' : 'Upload your files'}
          </h3>
          <p className="text-muted-foreground mb-6">
            Drag and drop files here, or click to browse
          </p>
          <label className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span className="text-foreground">Uploading files...</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Status */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recently Uploaded</h2>
          <div className="space-y-2">
            {uploadedFiles.map((fileName, index) => (
              <div key={index} className="flex items-center p-3 bg-card border border-border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="text-foreground">{fileName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-8 bg-muted/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Upload Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            Maximum file size: 100MB per file
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            Supported formats: All file types
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            Files are automatically scanned for security
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
            Duplicate files are automatically deduplicated
          </li>
        </ul>
      </div>
    </div>
  );
}