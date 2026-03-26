import { getLeadById } from "@/app/actions";
import { notFound } from "next/navigation";
import { LeadProfileClient } from "@/components/leads/LeadProfileClient";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return <LeadProfileClient lead={lead} />;
}
