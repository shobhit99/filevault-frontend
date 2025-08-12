import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';

// Token management
const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          setTokens(access, refreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          if (typeof window !== 'undefined' &&
              !window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, clear tokens and redirect to login
        clearTokens();
        if (typeof window !== 'undefined' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
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

export interface ApiResponse<T = unknown> {
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

  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<{
    user: User;
    access: string;
    refresh: string;
  }>> => {
    const response = await api.post('/api/login/', credentials);
    if (response.data.success) {
      const { user, access, refresh } = response.data.data;
      setTokens(access, refresh);
    }
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const refreshToken = getRefreshToken();
    const response = await api.post('/api/logout/', { refresh: refreshToken });
    clearTokens();
    return response.data;
  },

  verifyToken: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/api/token/verify/');
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<{ access: string }>> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
    if (response.data.access) {
      setTokens(response.data.access, refreshToken);
    }
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