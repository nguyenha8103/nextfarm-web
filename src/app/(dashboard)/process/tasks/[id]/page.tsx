import { ProcessTaskDetailPage } from '@/components/process/SeasonPages';

export function generateStaticParams() {
  return [{ id: 'TASK-001' }, { id: 'TASK-002' }, { id: 'TASK-003' }, { id: 'TASK-004' }, { id: 'TASK-005' }];
}

export default async function ProcessTaskDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProcessTaskDetailPage taskId={decodeURIComponent(id)} />;
}
