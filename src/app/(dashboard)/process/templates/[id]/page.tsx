import { ProcessTemplateDetailPage } from '@/components/process/SeasonPages';

export function generateStaticParams() {
  return [{ id: 'TPL-RICE-01' }, { id: 'TPL-VEG-02' }, { id: 'TPL-FRUIT-03' }];
}

export default async function ProcessTemplateDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProcessTemplateDetailPage templateId={decodeURIComponent(id)} />;
}
