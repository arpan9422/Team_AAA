'use client'
import { useState } from 'react';
import api from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user info
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'MANAGER') {
        window.location.href = '/manager-dashboard';
      } else if (user.role === 'TECHNICIAN') {
        window.location.href = '/technician-dashboard';
      } else {
        window.location.href = '/employee-dashboard';
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center " style={{ backgroundColor: 'var(--bg-soft)' }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-md" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--primary)' }}>Log In</div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text- font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="mt-0 text-center flex items-center">
            <a href="/forgot-password" className="text-sm hover:underline" style={{ color: 'var(--accent-cyan)' }}>Forgot Password?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-primary)' }}>
          Don't have an account? <a href="/signup" className="hover:underline" style={{ color: 'var(--accent-cyan)' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}