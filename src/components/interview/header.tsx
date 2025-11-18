import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
  <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              <span style={{ color: 'var(--devon-orange)' }}>Dev</span>
              <span style={{ color: 'var(--devon-blue)' }}>On</span>
              <span className="text-gray-700 ml-2">Interview Portal</span>
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}