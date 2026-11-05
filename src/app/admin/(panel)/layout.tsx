import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { dbConfigured } from "@/lib/db";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/nav";
import { LogoMark } from "@/components/logo";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="md:grid md:min-h-screen md:grid-cols-[230px_1fr]">
      <aside className="sticky top-0 z-20 flex items-center gap-3 overflow-x-auto bg-leaf-dark px-4 py-3 text-cream md:static md:flex-col md:items-stretch md:gap-6 md:overflow-visible md:px-5 md:py-6">
        <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="hidden leading-tight md:block">
            <span className="block font-serif text-lg font-bold">Natural Oil</span>
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-cream/50">Shop admin</span>
          </span>
        </Link>
        <AdminNav />
        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:mt-auto md:flex-col md:items-stretch">
          <Link href="/" target="_blank" className="rounded-xl px-3 py-2 text-sm text-cream/80 hover:bg-white/10">View shop ↗</Link>
          <form action={logout}><button className="w-full rounded-xl px-3 py-2 text-left text-sm text-cream/80 hover:bg-white/10">Sign out</button></form>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">
        {dbConfigured() ? children : (
          <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <p className="font-serif text-2xl font-bold">Connect your database</p>
            <p className="mt-2 text-sm">Run <code className="rounded bg-white px-1.5 py-0.5">npm run setup</code> in the project folder and paste your Neon connection string, then restart <code className="rounded bg-white px-1.5 py-0.5">npm run dev</code>.</p>
          </div>
        )}
      </main>
    </div>
  );
}
