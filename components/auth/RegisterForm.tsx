/**
 * Registration Form Component
 */

import React, { useState } from 'react';
import { Mail, Lock, UserPlus, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

interface PasswordStrength {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { t } = useAppTranslation('common');

  // Check password strength
  const passwordStrength: PasswordStrength = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    // Validation
    if (!email.trim()) {
      setValidationError(t('auth.validation.emailRequired'));
      return;
    }

    if (!isPasswordStrong) {
      setValidationError(t('auth.validation.passwordWeak'));
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(t('auth.register.passwordMismatch'));
      return;
    }

    try {
      await register({ email, password });
      onSuccess?.();
    } catch {
      // Error is handled by the context
    }
  };

  const displayError = validationError || error;

  const RequirementIndicator: React.FC<{ met: boolean; text: string }> = ({
    met,
    text,
  }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check size={12} className="text-green-400" />
      ) : (
        <X size={12} className="text-gray-500" />
      )}
      <span className={met ? 'text-green-400' : 'text-gray-500'}>{text}</span>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t('auth.register.title')}</h2>
        <p className="text-sm text-muted">{t('auth.register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={t('auth.register.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.register.emailPlaceholder')}
          leftIcon={<Mail size={16} />}
          autoComplete="email"
          disabled={isLoading}
        />

        <div>
          <Input
            label={t('auth.register.password')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.register.passwordPlaceholder')}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            autoComplete="new-password"
            disabled={isLoading}
          />
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              <RequirementIndicator
                met={passwordStrength.minLength}
                text={t('auth.register.minLength')}
              />
              <RequirementIndicator
                met={passwordStrength.uppercase}
                text={t('auth.register.uppercase')}
              />
              <RequirementIndicator
                met={passwordStrength.lowercase}
                text={t('auth.register.lowercase')}
              />
              <RequirementIndicator
                met={passwordStrength.number}
                text={t('auth.register.number')}
              />
            </div>
          )}
        </div>

        <Input
          label={t('auth.register.confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('auth.register.confirmPlaceholder')}
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="focus:outline-none hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="new-password"
          disabled={isLoading}
          error={
            confirmPassword && password !== confirmPassword
              ? t('auth.register.passwordMismatch')
              : undefined
          }
        />

        {displayError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{displayError}</p>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          icon={<UserPlus size={16} />}
          size="lg"
          disabled={!isPasswordStrong || password !== confirmPassword}
        >
          {t('auth.register.register')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          {t('auth.register.hasAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {t('auth.register.login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
