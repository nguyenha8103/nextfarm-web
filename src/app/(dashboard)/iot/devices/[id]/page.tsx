import { IotDeviceDetailPage } from '@/components/iot/IotPages';

const deviceIds = ['DEV-SEN-001', 'DEV-ACT-002', 'DEV-SEN-003', 'DEV-ACT-004'];

export function generateStaticParams() {
  return deviceIds.map((id) => ({ id }));
}

export default async function IotDeviceDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IotDeviceDetailPage deviceId={decodeURIComponent(id)} />;
}
