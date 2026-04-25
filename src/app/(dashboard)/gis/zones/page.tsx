import { DataPage } from '@/components/layout/DataPage';

export default function ZonesPage() {
  return (
    <DataPage
      eyebrow="GIS"
      title="Vung canh tac"
      description="Quan ly zone, lop ban do va chinh sach canh tac theo tung khu vuc."
      columns={['Zone', 'Loai cay', 'So thua', 'Trang thai']}
      rows={[
        ['Z-DL-01', 'Rau an la', '18', 'On dinh'],
        ['Z-BL-03', 'Ca phe', '42', 'Can theo doi'],
        ['Z-CT-07', 'Lua', '27', 'Moi tao'],
      ]}
    />
  );
}
