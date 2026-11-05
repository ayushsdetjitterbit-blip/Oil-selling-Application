import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Natural Oil" }, robots: { index: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[color-mix(in_srgb,var(--color-sand)_30%,var(--color-cream))]">{children}</div>;
}
