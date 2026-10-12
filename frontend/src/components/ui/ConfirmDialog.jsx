import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ open, onConfirm, onCancel, title, message, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-up">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <AlertTriangle className={danger ? 'text-red-600' : 'text-yellow-600'} size={24} />
        </div>
        <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary hover:bg-brand-dark'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
