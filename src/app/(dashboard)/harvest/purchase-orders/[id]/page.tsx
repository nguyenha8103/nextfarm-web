import { PurchaseOrderDetailPage } from '@/components/harvest/HarvestPage';

export function generateStaticParams() {
  return ['PO-2026-0042', 'PO-2026-0043', 'PO-2026-0044'].map((id) => ({ id }));
}

export default async function PurchaseOrderDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PurchaseOrderDetailPage orderId={decodeURIComponent(id)} />;
}
