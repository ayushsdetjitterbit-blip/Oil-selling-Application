import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { Totals } from "./pricing";
import type { CustomerInput } from "./validation";

export type PaymentMethod = "upi" | "card" | "cod";
export type OrderStatus = "awaiting_payment" | "confirmed" | "packed" | "shipped" | "delivered";
export type PaymentStatus = "pending" | "paid" | "cod_due" | "failed";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paymentRef: string | null;
  customer: CustomerInput;
  totals: Totals;
};

/**
 * File-backed store. Every function here is the whole "database" surface,
 * so swapping in Postgres/Prisma later only means rewriting this file.
 */
const FILE = process.env.ORDERS_FILE ?? path.join(process.cwd(), "data", "orders.json");
let queue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<Order[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Order[];
  } catch {
    return [];
  }
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function writeAll(orders: Order[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(orders, null, 2));
  await fs.rename(tmp, FILE);
}

export const newOrderId = () => "NO-" + randomBytes(5).toString("hex").toUpperCase();

export function createOrder(customer: CustomerInput, totals: Totals) {
  return withLock(async () => {
    const orders = await readAll();
    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      status: "awaiting_payment",
      paymentStatus: "pending",
      paymentMethod: null,
      paymentRef: null,
      customer,
      totals,
    };
    orders.push(order);
    await writeAll(orders);
    return order;
  });
}

export async function getOrder(id: string) {
  return (await readAll()).find((o) => o.id === id) ?? null;
}

export function updateOrder(id: string, patch: Partial<Order>) {
  return withLock(async () => {
    const orders = await readAll();
    const i = orders.findIndex((o) => o.id === id);
    if (i < 0) return null;
    orders[i] = { ...orders[i], ...patch };
    await writeAll(orders);
    return orders[i];
  });
}
