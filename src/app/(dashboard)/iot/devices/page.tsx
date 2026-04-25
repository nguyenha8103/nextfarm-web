import { DataPage } from '@/components/layout/DataPage';

export default function IotDevicesPage() {
  return (
    <DataPage
      eyebrow="IoT"
      title="Thiet bi"
      description="Danh sach thiet bi, gateway, pin va ket noi MQTT."
      columns={['Thiet bi', 'Loai', 'Pin', 'Trang thai']}
      rows={[
        ['SEN-DL-01', 'Soil sensor', '82%', 'Online'],
        ['GW-BL-02', 'Gateway', 'Nguon luoi', 'Online'],
        ['SEN-CT-09', 'Weather node', '24%', 'Can thay pin'],
      ]}
    />
  );
}
