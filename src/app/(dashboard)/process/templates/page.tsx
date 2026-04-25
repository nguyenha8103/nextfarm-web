import { DataPage } from '@/components/layout/DataPage';

export default function ProcessTemplatesPage() {
  return (
    <DataPage
      eyebrow="Process"
      title="Mau quy trinh"
      description="Mau cong viec, checkpoint va dieu kien ap dung cho tung loai cay."
      columns={['Ma mau', 'Ten quy trinh', 'Buoc', 'Trang thai']}
      rows={[
        ['TPL-VEG', 'Rau huu co', '9', 'Dang dung'],
        ['TPL-COF', 'Ca phe mua kho', '12', 'Dang dung'],
        ['TPL-RIC', 'Lua vu he thu', '7', 'Nhap'],
      ]}
    />
  );
}
