/**
 * Login Form Component
 */

import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
  lang?: 'en' | 'cn';
}

const translations = {
  en: {
    title: 'Welcome Back',
    subtitle: 'Sign in to sync your projects across devices',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    login: 'Sign In',
    noAccount: "Don't have an account?",
    register: 'Create one',
    forgotPassword: 'Forgot password?',
    demoAccount: 'Demo Account',
    demoHint: 'Click to auto-fill credentials',
  },
  cn: {
    title: '欢迎回来',
    subtitle: '登录以在多设备间同步您的项目',
    email: '邮箱',
    emailPlaceholder: '请输入邮箱',
    password: '密码',
    passwordPlaceholder: '请输入密码',
    login: '登录',
    noAccount: '还没有账号？',
    register: '立即注册',
    forgotPassword: '忘记密码？',
    demoAccount: '测试账号',
    demoHint: '点击自动填充',
  },
};

const DEMO_ACCOUNT = {
  email: 'demo@example.com',
  password: 'Demo123!',
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSuccess,
  lang = 'cn',
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    // Basic validation
    if (!email.trim()) {
      setValidationError(lang === 'cn' ? '请输入邮箱' : 'Email is required');
      return;
    }

    if (!password) {
      setValidationError(lang === 'cn' ? '请输入密码' : 'Password is required');
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
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.subtitle}</p>
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
          {t.login}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t.noAccount}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="transition-colors"
            style={{ color: 'var(--color-accent)' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {t.register}
          </button>
        </p>
      </div>

      {/* Demo Account Section */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-xs text-center mb-3" style={{ color: 'var(--color-text-muted)' }}>{t.demoAccount}</p>
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO_ACCOUNT.email);
            setPassword(DEMO_ACCOUNT.password);
          }}
          className="w-full p-3 rounded-lg transition-all group"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
            e.currentTarget.style.borderColor = 'var(--color-accent)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Email: </span>
                <span className="font-mono">{DEMO_ACCOUNT.email}</span>
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Password: </span>
                <span className="font-mono">{DEMO_ACCOUNT.password}</span>
              </div>
            </div>
            <span className="text-xs" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>
              {t.demoHint}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
