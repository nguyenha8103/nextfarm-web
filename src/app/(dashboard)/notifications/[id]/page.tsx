import { NotificationDetailPage } from '@/components/notification/NotificationPages';

const ids = ['NOTIF-001', 'NOTIF-002', 'NOTIF-003', 'NOTIF-004', 'NOTIF-005'];

export function generateStaticParams() {
  return ids.map((id) => ({ id }));
}

export default async function NotificationDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NotificationDetailPage id={decodeURIComponent(id)} />;
}
