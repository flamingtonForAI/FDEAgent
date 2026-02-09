/**
 * Registration Form Component
 */

import React, { useState } from 'react';
import { Mail, Lock, UserPlus, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  lang?: 'en' | 'cn';
}

const translations = {
  en: {
    title: 'Create Account',
    subtitle: 'Register to save and sync your ontology projects',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Create a password',
    confirmPassword: 'Confirm Password',
    confirmPlaceholder: 'Confirm your password',
    register: 'Create Account',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    requirements: {
      minLength: 'At least 8 characters',
      uppercase: 'One uppercase letter',
      lowercase: 'One lowercase letter',
      number: 'One number',
    },
    passwordMismatch: 'Passwords do not match',
  },
  cn: {
    title: '创建账号',
    subtitle: '注册以保存和同步您的本体论项目',
    email: '邮箱',
    emailPlaceholder: '请输入邮箱',
    password: '密码',
    passwordPlaceholder: '创建密码',
    confirmPassword: '确认密码',
    confirmPlaceholder: '再次输入密码',
    register: '注册',
    hasAccount: '已有账号？',
    login: '立即登录',
    requirements: {
      minLength: '至少 8 个字符',
      uppercase: '包含大写字母',
      lowercase: '包含小写字母',
      number: '包含数字',
    },
    passwordMismatch: '两次密码不一致',
  },
};

interface PasswordStrength {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onSuccess,
  lang = 'cn',
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const t = translations[lang];

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
      setValidationError(lang === 'cn' ? '请输入邮箱' : 'Email is required');
      return;
    }

    if (!isPasswordStrong) {
      setValidationError(
        lang === 'cn' ? '密码不符合要求' : 'Password does not meet requirements'
      );
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(t.passwordMismatch);
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
        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-sm text-muted">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label={t.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          leftIcon={<Mail size={16} />}
          autoComplete="email"
          disabled={isLoading}
        />

        <div>
          <Input
            label={t.password}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
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
                text={t.requirements.minLength}
              />
              <RequirementIndicator
                met={passwordStrength.uppercase}
                text={t.requirements.uppercase}
              />
              <RequirementIndicator
                met={passwordStrength.lowercase}
                text={t.requirements.lowercase}
              />
              <RequirementIndicator
                met={passwordStrength.number}
                text={t.requirements.number}
              />
            </div>
          )}
        </div>

        <Input
          label={t.confirmPassword}
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t.confirmPlaceholder}
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
              ? t.passwordMismatch
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
          {t.register}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          {t.hasAccount}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {t.login}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
