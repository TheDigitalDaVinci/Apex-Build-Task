'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X, ExternalLink, Table2 } from 'lucide-react';
import { GoogleSheetsIcon } from './GoogleSheetModal';

export interface ToastMessage {
  id: string;
  type: 'sheet' | 'success' | 'error' | 'info';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none font-sans">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#1F2937] text-white p-4 rounded-xl shadow-2xl border border-gray-700 flex items-start gap-3 animate-fade-in transition-all"
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'sheet' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <GoogleSheetsIcon className="w-4 h-4" />
              </div>
            )}
            {toast.type === 'success' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-100">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">{toast.description}</p>
            )}
            {toast.actionLabel && toast.onAction && (
              <button
                onClick={toast.onAction}
                className="mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {toast.actionLabel}
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
