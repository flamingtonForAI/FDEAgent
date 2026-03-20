/**
 * Login Form Component
 */

import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

// SECURITY: Only email is public hint — password never in frontend bundle
const DEMO_EMAIL = 'demo@example.com';

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSuccess,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { t } = useAppTranslation('common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    // Basic validation
    if (!email.trim()) {
      setValidationError(t('auth.validation.emailRequired'));
      return;
    }

    if (!password) {
      setValidationError(t('auth.validation.passwordRequired'));
      return;
    }

    try {
      await login({ email, password });
      onSuccess?.();
    } catch {
      // Error is handled by the context
    }
  };

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{t('auth.login.title')}</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={t('auth.login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.login.emailPlaceholder')}
          leftIcon={<Mail size={16} />}
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label={t('auth.login.password')}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.login.passwordPlaceholder')}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="current-password"
          disabled={isLoading}
        />

        {displayError && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{displayError}</p>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          icon={<LogIn size={16} />}
          size="lg"
        >
          {t('auth.login.login')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t('auth.login.noAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="transition-colors"
            style={{ color: 'var(--color-accent)' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {t('auth.login.register')}
          </button>
        </p>
      </div>

    </div>
  );
};

export default LoginForm;
