import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicLeadForm } from "@/components/public/PublicLeadForm";
import Image from "next/image";

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
      },
    },
  });

  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative h-32 md:h-48" style={{ backgroundColor: tenant.primaryColor }}>
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Profile / Context */}
        <div className="px-6 md:px-10 pb-10">
          <div className="flex justify-center -mt-16 md:-mt-20 relative z-10 mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center p-4">
               {tenant.logoUrl ? (
                 <Image src={tenant.logoUrl} alt={tenant.name} width={120} height={120} className="object-contain" />
               ) : (
                 <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold" 
                      style={{ backgroundColor: `${tenant.primaryColor}20`, color: tenant.primaryColor }}>
                   {tenant.name.substring(0, 2).toUpperCase()}
                 </div>
               )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
              Admisiones {tenant.name}
            </h1>
            <p className="text-lg text-gray-500">
              Déjanos tus datos para iniciar el proceso de admisión
            </p>
          </div>

          <PublicLeadForm 
            tenantId={tenant.id}
            tenantName={tenant.name}
            primaryColor={tenant.primaryColor}
            products={tenant.products}
          />
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>Impulsado por EduCRM</p>
      </div>
    </div>
  );
}
