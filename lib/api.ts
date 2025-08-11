import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include CSRF token if available
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  created_at: string;
  s3_url?: string;
  thumbnail_url?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parent: string | null;
  created_at: string;
}

export interface FilesResponse {
  files: FileItem[];
  folders: FolderItem[];
  storage_used: number;
  storage_limit: number;
}

// Authentication API
export const authApi = {
  register: async (userData: { username: string; password: string; email: string }): Promise<ApiResponse<User>> => {
    const response = await api.post('/api/register/', userData);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<User>> => {
    const response = await api.post('/api/login/', credentials);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/api/logout/');
    return response.data;
  },
};

// Files API
export const filesApi = {
  getFiles: async (folderId?: string, filters?: { name?: string; ordering?: string }): Promise<ApiResponse<FilesResponse>> => {
    const params = new URLSearchParams();
    if (folderId) params.append('folder_id', folderId);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    
    const response = await api.get(`/api/files/?${params.toString()}`);
    return response.data;
  },

  uploadFile: async (file: File, folderId?: string): Promise<ApiResponse<FileItem>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folder_id', folderId);

    const response = await api.post('/api/files/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/api/files/${fileId}/`);
    return response.data;
  },
};

// Folders API
export const foldersApi = {
  createFolder: async (folderData: { name: string; parent?: string }): Promise<ApiResponse<FolderItem>> => {
    const response = await api.post('/api/folders/', folderData);
    return response.data;
  },
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📽️';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return '🖼️';
    case 'mp4':
    case 'avi':
    case 'mov':
      return '🎥';
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵';
    case 'zip':
    case 'rar':
    case '7z':
      return '🗜️';
    case 'txt':
      return '📄';
    default:
      return '📁';
  }
};

export default api;