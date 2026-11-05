import { listSubscribers } from "@/lib/stats";
import { CopyButton } from "@/components/admin/copy-button";

export const metadata = { title: "Subscribers" };

export default async function Subscribers() {
  const subs = await listSubscribers(1000);
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-leaf-dark">Subscribers</h1>
          <p className="text-sm text-bark/60">{subs.length} people asked to hear about fresh batches (from the form in the shop footer).</p>
        </div>
        {subs.length > 0 && <CopyButton text={subs.map((s) => s.email).join(", ")} label="Copy all emails" />}
      </div>
      <div className="overflow-hidden rounded-2xl border border-sand bg-white">
        {subs.length === 0 ? <p className="p-10 text-center text-sm text-bark/60">No subscribers yet.</p> : (
          <ul className="divide-y divide-sand text-sm">
            {subs.map((s) => (
              <li key={s.email} className="flex justify-between px-5 py-3">
                <span>{s.email}</span>
                <span className="text-xs text-bark/55">{s.created_at.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
