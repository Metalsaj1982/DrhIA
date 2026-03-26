import { requireAuth } from "@/lib/tenant";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AIChatbot } from "@/components/chatbot/AIChatbot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — desktop only */}
      <Sidebar
        tenantName={session.tenantName}
        userName={session.name}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar userName={session.name} tenantName={session.tenantName} />

        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>

      {/* AI Chatbot — flotante en todo el dashboard */}
      <AIChatbot />
    </div>
  );
}
