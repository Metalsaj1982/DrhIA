import { getPipelineData } from "@/app/actions";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";

export default async function PipelinePage() {
  const columns = await getPipelineData();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-navy-700)' }}>
            Pipeline Escolar
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            Gestiona prospectos a través de las etapas de admisión
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 md:px-6 pb-4">
        <PipelineBoard initialColumns={columns} />
      </div>
    </div>
  );
}
