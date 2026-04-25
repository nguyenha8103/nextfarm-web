import { DataPage } from '@/components/layout/DataPage';

export default function HarvestPage() {
  return (
    <DataPage
      eyebrow="Harvest"
      title="Thu hoach"
      description="Len lich thu hoach, san luong du kien va truy xuat lo hang."
      columns={['Lo hang', 'San pham', 'San luong', 'Trang thai']}
      rows={[
        ['LOT-2401', 'Xa lach', '2.4 tan', 'Cho dong goi'],
        ['LOT-2402', 'Ca phe nhan', '5.1 tan', 'Da xuat'],
        ['LOT-2403', 'Lua ST25', '9.8 tan', 'Dang thu'],
      ]}
    />
  );
}
