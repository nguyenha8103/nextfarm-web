import { MapPanel } from '@/components/map/MapPanel';

export default function GisMapPage() {
  return (
    <div className="grid h-full min-h-[720px] grid-cols-[minmax(320px,420px)_1fr] overflow-hidden max-lg:grid-cols-1">
      <section className="border-r border-[#dbe3dc] bg-white p-5 max-lg:border-r-0 max-lg:border-b">
        <p className="text-sm font-medium text-[#236b4a]">GIS</p>
        <h1 className="mt-2 text-2xl font-semibold">Ban do nong trai</h1>
        <p className="mt-2 text-sm leading-6 text-[#66736b]">
          Quan ly vung trong, thua dat, lop NDVI va du lieu vung tu Gateway.
        </p>
        <div className="mt-5 grid gap-3">
          {[
            ['Thua dang theo doi', '128'],
            ['Vung canh tac', '34'],
            ['Canh bao NDVI', '7'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-[#dbe3dc] p-4">
              <p className="text-sm text-[#66736b]">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <MapPanel />
    </div>
  );
}
