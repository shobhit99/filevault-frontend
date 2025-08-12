'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Home,
  Upload,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  HardDrive
} from 'lucide-react';
import { ChartPieSlice } from 'phosphor-react';
import { formatFileSize, filesApi } from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 15000000000 });
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Load storage information
  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        const response = await filesApi.getFiles();
        if (response.success) {
          setStorageInfo({
            used: response.data.storage_used,
            limit: response.data.storage_limit
          });
        }
      } catch (error) {
        console.error('Failed to load storage info:', error);
      }
    };

    if (user) {
      loadStorageInfo();
    }
  }, [user]);

  const navigation = [
    { name: 'Files', href: '/dashboard', icon: Home, current: true },
    { name: 'Upload', href: '/dashboard/upload', icon: Upload, current: false },
    { name: 'Search', href: '/dashboard/search', icon: Search, current: false },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, current: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className="relative">
                <ChartPieSlice className="h-8 w-8 text-blue-600 drop-shadow-lg" weight="fill" />
                <div className="absolute inset-0 h-8 w-8 bg-blue-400 rounded-full opacity-30 blur-sm animate-pulse"></div>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">File Vault</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-64 lg:flex lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          {/* Logo */}
          <div className="flex h-16 items-center px-4">
            <div className="relative">
              <ChartPieSlice className="h-8 w-8 text-blue-600 drop-shadow-lg" weight="fill" />
              <div className="absolute inset-0 h-8 w-8 bg-blue-400 rounded-full opacity-30 blur-sm animate-pulse"></div>
            </div>
            <span className="ml-2 text-xl font-bold text-foreground">File Vault</span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Storage info */}
          <div className="p-4 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <HardDrive className="h-4 w-4 mr-2" />
                Storage Used
              </div>
              <div className="w-full bg-background rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((storageInfo.used / storageInfo.limit) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(storageInfo.used)} of {formatFileSize(storageInfo.limit)} used
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-card/95 backdrop-blur-sm px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <div className="relative">
              <ChartPieSlice className="h-6 w-6 text-blue-600 drop-shadow-lg" weight="fill" />
              <div className="absolute inset-0 h-6 w-6 bg-blue-400 rounded-full opacity-30 blur-sm animate-pulse"></div>
            </div>
            <span className="ml-2 text-lg font-semibold text-foreground">File Vault</span>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}