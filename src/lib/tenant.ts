import { getSession, SessionPayload } from "./auth";
import { redirect } from "next/navigation";

// Returns session or redirects to login page — use in Server Components
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

// Returns the tenant_id from session — use in API routes/server actions for data scoping
export async function getTenantId(): Promise<string> {
  const session = await requireAuth();
  return session.tenantId;
}

// Helper to build tenant-scoped where clause
export function tenantWhere(tenantId: string) {
  return { tenantId };
}
