'use client'
import { useState } from 'react';
import { z } from 'zod';
import api from '@/lib/api';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(9, 'Password must be more than 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  role: z.string().min(1, 'Please select a role'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof SignupFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signupSchema.parse(formData);
      setErrors({});

      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(), // Backend expects uppercase roles
      });

      alert('Signup successful! Please log in.');
      window.location.href = '/login';
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignupFormData, string>> = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as keyof SignupFormData;
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        const apiError = error.response?.data?.error || 'Signup failed. Please try again.';
        alert(apiError);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-soft)' }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-md" style={{ backgroundColor: 'var(--bg-main)' }}>
        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--primary)' }}>Sign Up</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Re-enter Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            >
              <option value="">Select a role</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="technical">Technical</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>
          <button
            type="submit"
            className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: 'var(--accent-cyan)' }}
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-primary)' }}>
          Already have an account? <a href="/login" className="hover:underline" style={{ color: 'var(--accent-cyan)' }}>Log in</a>
        </p>
      </div>
    </div>
  );
}