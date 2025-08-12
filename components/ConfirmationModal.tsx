'use client';

import React from 'react';
import { Warning } from 'phosphor-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          iconBg: 'bg-yellow-100'
        };
      case 'info':
        return {
          icon: 'text-blue-500',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconBg: 'bg-blue-100'
        };
      default:
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-600/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white border border-gray-200 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                <Warning className={`h-6 w-6 ${styles.icon}`} weight="bold" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto transition-colors ${styles.confirmButton}`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}