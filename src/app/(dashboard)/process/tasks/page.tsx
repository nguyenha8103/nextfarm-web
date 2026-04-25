import { DataPage } from '@/components/layout/DataPage';

export default function ProcessTasksPage() {
  return (
    <DataPage
      eyebrow="Process"
      title="Cong viec"
      description="Theo doi tien do cong viec, nguoi phu trach va han xu ly."
      columns={['Cong viec', 'Nguoi phu trach', 'Han', 'Trang thai']}
      rows={[
        ['Kiem tra do am', 'Tran Minh', 'Hom nay', 'Dang lam'],
        ['Phun sinh hoc', 'Le An', 'Ngay mai', 'Cho duyet'],
        ['Ghi nhat ky vu', 'Nguyen Ha', '30/04', 'Moi'],
      ]}
    />
  );
}
