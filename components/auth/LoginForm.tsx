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
  },
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
          autoComplete="current-password"
          disabled={isLoading}
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
          icon={<LogIn size={16} />}
          size="lg"
        >
          {t.login}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          {t.noAccount}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {t.register}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
