import { DataPage } from '@/components/layout/DataPage';

export default function ParcelsPage() {
  return (
    <DataPage
      eyebrow="GIS"
      title="Thua dat"
      description="Danh sach thua dat, dien tich, trang thai canh tac va lien ket ban do."
      columns={['Ma thua', 'Khu vuc', 'Dien tich', 'Trang thai']}
      rows={[
        ['PRC-001', 'Da Lat', '12.4 ha', 'Dang canh tac'],
        ['PRC-014', 'Bao Loc', '8.1 ha', 'Can kiem tra'],
        ['PRC-032', 'Cu Chi', '5.6 ha', 'Nghi vu'],
      ]}
    />
  );
}
