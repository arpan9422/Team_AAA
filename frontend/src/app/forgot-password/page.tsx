'use client'
import { useState } from 'react';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(9, 'Password must be more than 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      emailSchema.parse({ email });
      setIsLoading(true);
      setMessage('');

      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage('OTP sent to your email address');
      setStep('otp');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      otpSchema.parse({ otp });
      setIsLoading(true);
      setMessage('');

      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage('OTP verified successfully');
      setStep('reset');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      resetPasswordSchema.parse({ password, confirmPassword });
      setIsLoading(true);
      setMessage('');

      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage('Password reset successfully!');
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage('');

    // Simulate API call to resend OTP
    await new Promise(resolve => setTimeout(resolve, 2000));

    setMessage('OTP resent to your email address');
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-soft)' }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-md" style={{ backgroundColor: 'var(--bg-main)' }}>
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--primary)' }}>
          {step === 'email' && 'Forgot Password'}
          {step === 'otp' && 'Enter OTP'}
          {step === 'reset' && 'Reset Password'}
        </h1>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-sm text-center mb-4" style={{ color: 'var(--text-primary)' }}>
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-sm text-center mb-4" style={{ color: 'var(--text-primary)' }}>
              We've sent a 6-digit OTP to {email}. Please enter it below.
            </p>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent text-center text-lg tracking-widest"
                style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                placeholder="000000"
              />
              {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="w-full text-sm py-2 px-4 rounded-md hover:opacity-90 focus:outline-none disabled:opacity-50"
              style={{ color: 'var(--accent-cyan)' }}
            >
              Resend OTP
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <p className="text-sm text-center mb-4" style={{ color: 'var(--text-primary)' }}>
              Enter your new password below.
            </p>
            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-cyan)' }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-center text-sm" style={{ color: step === 'reset' ? 'green' : 'var(--accent-cyan)' }}>
            {message}
          </p>
        )}

        <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-primary)' }}>
          Remember your password? <a href="/login" className="hover:underline" style={{ color: 'var(--accent-cyan)' }}>Log in</a>
        </p>
      </div>
    </div>
  );
}