import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-soft)' }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-md text-center" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Welcome to GearGuard</h1>
        <p className="mb-8" style={{ color: 'var(--text-primary)' }}>Manage your equipment with ease.</p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-main)' }}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="block w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: 'var(--accent-cyan)', color: 'var(--bg-main)' }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
