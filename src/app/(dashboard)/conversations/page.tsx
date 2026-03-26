import { getConversations } from "@/app/actions";
import { ConversationsClient } from "@/components/conversations/ConversationsClient";

export default async function ConversationsPage() {
  const conversations = await getConversations();
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 md:px-6 py-4 shrink-0">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
          Conversaciones
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
          {conversations.length} hilos de mensajes activos
        </p>
      </div>
      <div className="flex-1 overflow-hidden px-4 md:px-6 pb-4">
        <ConversationsClient conversations={conversations} />
      </div>
    </div>
  );
}
