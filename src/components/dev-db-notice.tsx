/** Only rendered while running `npm run dev`: tells the shop owner exactly why the database isn't connected. */
export function DevDbNotice({ problem }: { problem: string }) {
  return (
    <div role="alert" className="border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-sm text-amber-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-x-2">
        <b className="shrink-0">Database not connected:</b>
        <span>{problem}</span>
        <span className="text-xs text-amber-900/70">(Only you see this bar, because the shop is running with npm run dev.)</span>
      </div>
    </div>
  );
}
