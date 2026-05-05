import { ReportGeneratorPage } from '@/components/report/ReportPages';

const reportTypes = ['zone-summary', 'compliance', 'yield', 'ndvi-trend'];

export function generateStaticParams() {
  return reportTypes.map((type) => ({ type }));
}

export default async function ReportTypeRoutePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <ReportGeneratorPage type={decodeURIComponent(type)} />;
}
