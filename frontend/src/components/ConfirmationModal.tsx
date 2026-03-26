"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  errorMessage?: string | null;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  errorMessage = null,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20";
      default:
        return "bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-6 mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl relative text-center">

        {getIcon()}

        <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic mb-3">{title}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-8 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${getVariantStyles()} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            {cancelText}
          </button>
        </div>

      </div>
    </div>
  );
}
