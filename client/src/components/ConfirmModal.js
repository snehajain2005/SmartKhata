import React, { useEffect } from 'react';

/**
 * Reusable confirmation modal — replaces window.confirm() everywhere.
 *
 * Props:
 *   title      - Modal heading
 *   message    - Body text / description
 *   confirmLabel - Text on confirm button (default: "Confirm")
 *   cancelLabel  - Text on cancel button (default: "Cancel")
 *   variant    - "danger" | "warning" | "default"
 *   onConfirm  - Callback when user confirms
 *   onCancel   - Callback when user cancels / closes
 */
export default function ConfirmModal({
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const iconMap = {
    danger: (
      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
    ),
    warning: (
      <div className="w-12 h-12 rounded-2xl bg-saffron-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-saffron-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    ),
    default: (
      <div className="w-12 h-12 rounded-2xl bg-ink-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  };

  const confirmBtnClass = {
    danger: 'btn-danger',
    warning: 'bg-saffron-500 hover:bg-saffron-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.97] inline-flex items-center justify-center gap-2',
    default: 'btn-primary',
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          {iconMap[variant] || iconMap.default}
          <h3 className="font-display text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`${confirmBtnClass[variant] || confirmBtnClass.default} flex-1`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
