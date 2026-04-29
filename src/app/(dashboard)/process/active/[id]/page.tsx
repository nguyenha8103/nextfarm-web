import { ProcessActiveDetailPage } from '@/components/process/SeasonPages';

export function generateStaticParams() {
  return [{ id: 'CP-2026-001' }, { id: 'CP-2026-002' }, { id: 'CP-2026-003' }];
}

export default async function ProcessActiveDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProcessActiveDetailPage processId={decodeURIComponent(id)} />;
}
