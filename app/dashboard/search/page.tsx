'use client';

import React, { useState, useEffect } from 'react';
import { Search, FileText, Folder, Calendar, HardDrive, Filter, X } from 'lucide-react';
import { filesApi, FileItem, FolderItem, formatFileSize, formatDate, getFileIcon } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    files: FileItem[];
    folders: FolderItem[];
  }>({ files: [], folders: [] });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
      const response = await filesApi.getFiles(undefined, {
        name: searchQuery,
        ordering
      });

      if (response.success) {
        setSearchResults({
          files: response.data.files,
          folders: response.data.folders
        });
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ files: [], folders: [] });
  };

  const totalResults = searchResults.files.length + searchResults.folders.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Search Files</h1>
        <p className="text-muted-foreground">Find your files and folders quickly</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="block w-full pl-10 pr-12 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="flex items-center mt-4 space-x-4">
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'created_at' | 'size')}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="name">Name</option>
                  <option value="created_at">Date</option>
                  <option value="size">Size</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Results */}
      {(searchResults.files.length > 0 || searchResults.folders.length > 0) && (
        <div className="space-y-6">
          {/* Folders */}
          {searchResults.folders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <Folder className="h-5 w-5 mr-2" />
                Folders ({searchResults.folders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center">
                      <Folder className="h-8 w-8 text-primary mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {folder.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(folder.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {searchResults.files.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Files ({searchResults.files.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">{getFileIcon(file.name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
                          <span className="flex items-center">
                            <HardDrive className="h-3 w-3 mr-1" />
                            {formatFileSize(file.size)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(file.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {searchQuery && !loading && totalResults === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or check the spelling
          </p>
        </div>
      )}

      {/* Empty State */}
      {!searchQuery && (
        <div className="text-center py-12">
          <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Search your files</h3>
          <p className="text-muted-foreground">
            Enter a search term to find your files and folders
          </p>
        </div>
      )}
    </div>
  );
}