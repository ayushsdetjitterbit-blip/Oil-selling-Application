"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
      <p className="font-serif text-2xl font-bold">Couldn&apos;t load this page</p>
      <p className="mt-2 text-sm">The database didn&apos;t answer. If you use Neon, the database may be waking up. Wait a few seconds and try again. If it keeps failing, check DATABASE_URL in .env.</p>
      {error.digest && <p className="mt-2 text-xs text-red-800/70">Error reference: {error.digest}</p>}
      <button onClick={reset} className="btn btn-primary mt-4">Try again</button>
    </div>
  );
}
