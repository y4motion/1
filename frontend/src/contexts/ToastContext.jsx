import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const showToast = {
    success: (message, options = {}) => {
      toast.success(message, {
        icon: <CheckCircle size={20} />,
        style: {
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#10b981',
          backdropFilter: 'blur(10px)',
          fontWeight: '500',
          ...options.style
        },
        ...options
      });
    },
    
    error: (message, options = {}) => {
      toast.error(message, {
        icon: <XCircle size={20} />,
        style: {
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#ef4444',
          backdropFilter: 'blur(10px)',
          fontWeight: '500',
          ...options.style
        },
        ...options
      });
    },
    
    warning: (message, options = {}) => {
      toast(message, {
        icon: <AlertCircle size={20} />,
        style: {
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#f59e0b',
          backdropFilter: 'blur(10px)',
          fontWeight: '500',
          ...options.style
        },
        ...options
      });
    },
    
    info: (message, options = {}) => {
      toast(message, {
        icon: <Info size={20} />,
        style: {
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#3b82f6',
          backdropFilter: 'blur(10px)',
          fontWeight: '500',
          ...options.style
        },
        ...options
      });
    },
    
    loading: (message, options = {}) => {
      return toast.loading(message, {
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          fontWeight: '500',
          ...options.style
        },
        ...options
      });
    },
    
    promise: (promise, messages) => {
      return toast.promise(
        promise,
        {
          loading: messages.loading,
          success: messages.success,
          error: messages.error
        },
        {
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            fontWeight: '500'
          }
        }
      );
    },
    
    dismiss: (toastId) => {
      toast.dismiss(toastId);
    }
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 90,
          right: 20
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px 20px',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
            maxWidth: '420px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }
        }}
      />
    </ToastContext.Provider>
  );
}
