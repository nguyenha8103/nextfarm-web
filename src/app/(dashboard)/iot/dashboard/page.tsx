import { TelemetryChart } from '@/components/charts/TelemetryChart';

export default function IotDashboardPage() {
  return (
    <section className="p-6">
      <p className="text-sm font-medium text-[#236b4a]">IoT</p>
      <h1 className="mt-2 text-2xl font-semibold">Telemetry dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736b]">
        Theo doi cam bien moi truong va trang thai thiet bi theo thoi gian thuc.
      </p>
      <div className="mt-6 rounded-lg border border-[#dbe3dc] bg-white p-5">
        <TelemetryChart />
      </div>
    </section>
  );
}
