import { listVariants } from "@/lib/inventory";
import { PRODUCTS } from "@/lib/products";
import { Bottle } from "@/components/bottle";
import { VariantRow } from "@/components/admin/variant-row";

export const metadata = { title: "Prices & stock" };

export default async function Products() {
  const rows = await listVariants();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const units = rows.reduce((s, r) => s + r.stock, 0);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold text-leaf-dark">Prices & stock</h1>
        <p className="text-sm text-bark/60">Changes go live on the shop as soon as you press Save. {units} bottles in stock across {rows.length} sizes.</p>
      </div>
      {PRODUCTS.map((p) => (
        <section key={p.slug} className="rounded-2xl border border-sand bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-12 place-items-center rounded-xl bg-sand/50"><Bottle color={p.color} className="h-12" /></span>
            <div><h2 className="font-serif text-lg font-bold">{p.name}</h2><p className="text-xs text-bark/55">{p.category} · {p.tagline}</p></div>
          </div>
          <div className="mt-3">
            {p.sizes.map((s) => {
              const r = byId.get(`${p.slug}:${s.id}`);
              if (!r) return null;
              return <VariantRow key={r.id} id={r.id} label={s.label} litres={s.litres} price={r.price} mrp={r.mrp} stock={r.stock} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
