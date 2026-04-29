import { ProcessLogDetailPage } from '@/components/process/SeasonPages';

export function generateStaticParams() {
  return [{ id: 'LOG-001' }, { id: 'LOG-002' }, { id: 'LOG-003' }];
}

export default async function ProcessLogDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProcessLogDetailPage logId={decodeURIComponent(id)} />;
}
