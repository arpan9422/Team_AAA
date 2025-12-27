'use client'
export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center " style={{ backgroundColor: 'var(--bg-soft)' }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-md" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--primary)' }}>Log In</div>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text- font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
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
            className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Log In
          </button>
        </form>
        
        <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-primary)' }}>
          Don't have an account? <a href="/signup" className="hover:underline" style={{ color: 'var(--accent-cyan)' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}