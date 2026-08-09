import "server-only";

export type SupportTicket = {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved";
  note: string;
  createdAt: string;
  updatedAt: string;
};

export function supportTicketsFromStore(store: unknown): SupportTicket[] {
  if (!store || typeof store !== "object" || Array.isArray(store)) return [];
  const value = (store as { supportTickets?: unknown }).supportTickets;
  return Array.isArray(value) ? (value as SupportTicket[]) : [];
}
