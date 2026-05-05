import { ReportExportPage } from '@/components/report/ReportPages';

const jobIds = ['JOB-RPT-001', 'JOB-RPT-002', 'JOB-RPT-003'];

export function generateStaticParams() {
  return jobIds.map((jobId) => ({ jobId }));
}

export default async function ReportExportRoutePage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return <ReportExportPage jobId={decodeURIComponent(jobId)} />;
}
