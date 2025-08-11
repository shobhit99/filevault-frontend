'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  List, 
  Upload, 
  Search, 
  Filter, 
  Plus, 
  FolderPlus, 
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Folder,
  ArrowLeft,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { filesApi, foldersApi, FileItem, FolderItem, formatFileSize, formatDate, getFileIcon } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<FolderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 15000000000 });

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
      const response = await filesApi.getFiles(currentFolder || undefined, {
        name: searchQuery || undefined,
        ordering
      });
      
      if (response.success) {
        setFiles(response.data.files);
        setFolders(response.data.folders);
        setStorageInfo({
          used: response.data.storage_used,
          limit: response.data.storage_limit
        });
      }
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [currentFolder, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const response = await filesApi.uploadFile(file, currentFolder || undefined);
        if (response.success) {
          toast.success(`${file.name} uploaded successfully`);
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    });

    await Promise.all(uploadPromises);
    loadFiles();
  };

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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await foldersApi.createFolder({
        name: newFolderName,
        parent: currentFolder || undefined
      });

      if (response.success) {
        toast.success('Folder created successfully');
        setNewFolderName('');
        setShowCreateFolder(false);
        loadFiles();
      }
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await filesApi.deleteFile(fileId);
      if (response.success) {
        toast.success('File deleted successfully');
        loadFiles();
      }
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleFolderClick = (folder: FolderItem) => {
    setCurrentFolder(folder.id);
    setFolderPath([...folderPath, folder]);
  };

  const handleBackClick = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    }
  };

  const toggleSort = (field: 'name' | 'created_at' | 'size') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="p-6 min-h-screen"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {dragOver && (
        <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary z-50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-xl font-semibold text-primary">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {folderPath.length > 0 && (
              <button
                onClick={handleBackClick}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
            )}
            <h1 className="text-2xl font-bold text-foreground">
              {folderPath.length > 0 ? folderPath[folderPath.length - 1].name : 'My Files'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </button>
            
            <label className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* Breadcrumb */}
        {folderPath.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <button
              onClick={() => {
                setCurrentFolder(null);
                setFolderPath([]);
              }}
              className="hover:text-foreground transition-colors"
            >
              Home
            </button>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span className="mx-2">/</span>
                <button
                  onClick={() => {
                    const newPath = folderPath.slice(0, index + 1);
                    setFolderPath(newPath);
                    setCurrentFolder(folder.id);
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Search and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleSort('name')}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  sortBy === 'name' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Name
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </button>
              
              <button
                onClick={() => toggleSort('created_at')}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  sortBy === 'created_at' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Date
                {sortBy === 'created_at' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </button>
              
              <button
                onClick={() => toggleSort('size')}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  sortBy === 'size' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Size
                {sortBy === 'size' && (
                  sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading files...</span>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="group bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="flex flex-col items-center text-center">
                    <Folder className="h-12 w-12 text-primary mb-2" />
                    <p className="text-sm font-medium text-foreground truncate w-full" title={folder.name}>
                      {folder.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(folder.created_at)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-200 relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-2">{getFileIcon(file.name)}</div>
                    <p className="text-sm font-medium text-foreground truncate w-full" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(file.created_at)}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      {file.s3_url && (
                        <a
                          href={file.s3_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 bg-background/80 rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="View file"
                        >
                          <Eye className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 bg-background/80 rounded text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-1">Actions</div>
              </div>
              
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="col-span-6 flex items-center">
                    <Folder className="h-5 w-5 text-primary mr-3" />
                    <span className="text-foreground">{folder.name}</span>
                  </div>
                  <div className="col-span-2 text-muted-foreground">—</div>
                  <div className="col-span-3 text-muted-foreground">{formatDate(folder.created_at)}</div>
                  <div className="col-span-1"></div>
                </div>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="col-span-6 flex items-center">
                    <span className="text-2xl mr-3">{getFileIcon(file.name)}</span>
                    <span className="text-foreground">{file.name}</span>
                  </div>
                  <div className="col-span-2 text-muted-foreground">{formatFileSize(file.size)}</div>
                  <div className="col-span-3 text-muted-foreground">{formatDate(file.created_at)}</div>
                  <div className="col-span-1 flex space-x-1">
                    {file.s3_url && (
                      <a
                        href={file.s3_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredFiles.length === 0 && filteredFolders.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No files yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No files match your search.' : 'Upload your first files to get started.'}
              </p>
              {!searchQuery && (
                <label className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                </label>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}