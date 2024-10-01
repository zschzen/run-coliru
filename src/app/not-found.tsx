import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found.</p>
        <Link href="/" className="text-lg text-blue-600 hover:underline">
          Go back home
        </Link>
      </div>
    </div>
  );
}
