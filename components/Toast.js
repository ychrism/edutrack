/**
 * Composant Toast pour les notifications
 * Affiche des messages temporaires avec animations
 */
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

let showToastFunction = null;

export const toast = {
  success: (message) => showToastFunction?.({ type: 'success', message }),
  error: (message) => showToastFunction?.({ type: 'error', message }),
  warning: (message) => showToastFunction?.({ type: 'warning', message }),
  info: (message) => showToastFunction?.({ type: 'info', message }),
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFunction = (toast) => {
      const id = Date.now();
      const newToast = { ...toast, id };
      
      setToasts(prev => [...prev, newToast]);
      
      // Auto-remove après 5 secondes
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    return () => {
      showToastFunction = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center p-4 rounded-lg border-2 border-black shadow-lg
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right
            ${getColors(toast.type)}
          `}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          {getIcon(toast.type)}
          <span className="ml-3 text-sm font-medium flex-1">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}