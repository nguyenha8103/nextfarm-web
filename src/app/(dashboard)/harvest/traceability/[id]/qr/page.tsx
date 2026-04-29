import { TraceabilityQrPage } from '@/components/harvest/HarvestPage';

export function generateStaticParams() {
  return ['TRC-HR-001', 'TRC-HR-003'].map((id) => ({ id }));
}

export default async function TraceabilityQrRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TraceabilityQrPage traceId={decodeURIComponent(id)} />;
}
