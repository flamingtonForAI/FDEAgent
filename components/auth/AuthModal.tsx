/**
 * Auth Modal Component
 * Displays login/register forms in a modal overlay
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  lang?: 'en' | 'cn';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  lang = 'cn',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { isAuthenticated } = useAuth();

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Close modal when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 glass-surface rounded-2xl p-8 shadow-2xl border border-white/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Content */}
        {mode === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onSuccess={onClose}
            lang={lang}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
            onSuccess={onClose}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
