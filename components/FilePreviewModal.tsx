'use client';

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    size: number;
    s3_url?: string;
  } | null;
}

export default function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  if (!isOpen || !file) return null;

  const getFileType = (filename: string): 'image' | 'pdf' | 'other' => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const fileType = getFileType(file.name);
  const canPreview = fileType === 'image' || fileType === 'pdf';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl max-w-6xl max-h-[90vh] w-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate" title={file.name}>
              {file.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {file.s3_url && (
              <>
                <a
                  href={file.s3_url}
                  download={file.name}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  title="Download file"
                >
                  <Download className="h-5 w-5" />
                </a>
                <a
                  href={file.s3_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!canPreview ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                <div className="text-4xl">📄</div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Preview not available</h3>
              <p className="text-muted-foreground mb-4">
                This file type cannot be previewed in the browser.
              </p>
              {file.s3_url && (
                <div className="flex space-x-2">
                  <a
                    href={file.s3_url}
                    download={file.name}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                  <a
                    href={file.s3_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
          ) : fileType === 'image' ? (
            <div className="flex items-center justify-center h-full p-4">
              <img
                src={file.s3_url}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex flex-col items-center justify-center text-center">
                        <div class="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mb-4">
                          <div class="text-4xl">🖼️</div>
                        </div>
                        <h3 class="text-lg font-semibold text-foreground mb-2">Failed to load image</h3>
                        <p class="text-muted-foreground">The image could not be displayed.</p>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          ) : fileType === 'pdf' ? (
            <div className="h-full">
              <iframe
                src={file.s3_url}
                className="w-full h-full border-0"
                title={file.name}
                onError={() => {
                  // Fallback for PDF loading errors
                  console.error('Failed to load PDF');
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}