'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileUp,
  Layers3,
  Map,
  MapPin,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  Upload,
  Wheat,
  X,
} from 'lucide-react';

type GisSection = 'map' | 'parcels' | 'zones' | 'import' | 'layers';
type ParcelStatus = 'active' | 'draft' | 'abandoned';

type Parcel = {
  id: string;
  code: string;
  area: number;
  zone: string;
  farmer: string;
  crop: string;
  status: ParcelStatus;
  ndvi: string;
};

type Zone = {
  id: string;
  name: string;
  level: string;
  area: number;
  parcels: number;
  mainCrop: string;
  status: string;
};

type LayerItem = {
  id: string;
  name: string;
  type: string;
  source: string;
  enabled: boolean;
  updatedAt: string;
};

type DrillLevel = 'vietnam' | 'province' | 'farm' | 'parcel';
type AgricultureStatus = 'growing' | 'harvest_soon' | 'empty' | 'alert';
type PolygonGeometry = {
  type: 'Polygon';
  coordinates: [number, number][][];
};

type MapEntity = {
  id: string;
  level: DrillLevel;
  name: string;
  parentId?: string;
  area: string;
  crop: string;
  season: string;
  status: AgricultureStatus;
  adminName: string;
  parcels: number;
  iot: number;
  aiRisk: string;
  position: string;
  shape: string;
  rotation: string;
  geometry?: PolygonGeometry;
  centroid?: [number, number];
};

type MapLayerState = {
  farm: boolean;
  iot: boolean;
  ai: boolean;
};

type GeoJsonData = Parameters<maplibregl.GeoJSONSource['setData']>[0];

const VIETNAM_CENTER: [number, number] = [108.2772, 14.0583];
const VIETNAM_ZOOM = 6;

const osmRasterStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};
const sectionTabs = [
  { id: 'map', label: 'Bản đồ', href: '/gis/map/', icon: Map },
  { id: 'parcels', label: 'Thửa đất', href: '/gis/parcels/', icon: MapPin },
  { id: 'zones', label: 'Vùng canh tác', href: '/gis/zones/', icon: Layers3 },
  { id: 'import', label: 'Nhập dữ liệu', href: '/gis/import/', icon: FileUp },
  { id: 'layers', label: 'Lớp bản đồ', href: '/gis/layers/', icon: Settings2 },
] satisfies Array<{ id: GisSection; label: string; href: string; icon: typeof Map }>;

const initialParcels: Parcel[] = [
  { id: 'p-001', code: 'P-HCM-001', area: 2.45, zone: 'Vùng rau Củ Chi', farmer: 'Nguyễn Văn An', crop: 'Rau ăn lá', status: 'active', ndvi: 'Ổn định' },
  { id: 'p-002', code: 'P-DN-014', area: 1.82, zone: 'Vùng cây ăn trái Đồng Nai', farmer: 'Trần Thị Bình', crop: 'Sầu riêng', status: 'active', ndvi: 'Cần theo dõi' },
  { id: 'p-003', code: 'P-LA-032', area: 3.1, zone: 'Vùng lúa Long An', farmer: 'Lê Văn Công', crop: 'Lúa ST25', status: 'draft', ndvi: 'Chưa quét' },
  { id: 'p-004', code: 'P-CT-020', area: 1.35, zone: 'Vùng rau Củ Chi', farmer: 'Phạm Thị Dung', crop: 'Cải xanh', status: 'abandoned', ndvi: 'Rủi ro' },
];

const zones: Zone[] = [
  { id: 'z-cu-chi', name: 'Vùng rau Củ Chi', level: 'Huyện', area: 38.4, parcels: 18, mainCrop: 'Rau ăn lá', status: 'Ổn định' },
  { id: 'z-dong-nai', name: 'Vùng cây ăn trái Đồng Nai', level: 'Tỉnh', area: 52.8, parcels: 24, mainCrop: 'Sầu riêng', status: 'Cần theo dõi' },
  { id: 'z-long-an', name: 'Vùng lúa Long An', level: 'Tỉnh', area: 71.2, parcels: 31, mainCrop: 'Lúa', status: 'Đang mở rộng' },
];

const layers: LayerItem[] = [
  { id: 'parcel', name: 'Thửa đất', type: 'GeoJSON Polygon', source: 'GIS Service', enabled: true, updatedAt: '27/04/2026 08:30' },
  { id: 'zone', name: 'Vùng canh tác', type: 'GeoJSON Polygon', source: 'GIS Service', enabled: true, updatedAt: '27/04/2026 08:30' },
  { id: 'ndvi', name: 'NDVI', type: 'WMS Raster', source: 'GeoServer', enabled: false, updatedAt: '22/04/2026 02:00' },
  { id: 'satellite', name: 'Vệ tinh', type: 'WMTS', source: 'GeoServer', enabled: false, updatedAt: '20/04/2026 02:00' },
];

const statusLabel: Record<ParcelStatus, string> = {
  active: 'Đang canh tác',
  draft: 'Nháp',
  abandoned: 'Ngừng canh tác',
};

const statusClass: Record<ParcelStatus, string> = {
  active: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]',
  draft: 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]',
  abandoned: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
};

const agricultureStatusLabel: Record<AgricultureStatus, string> = {
  growing: 'Đang trồng',
  harvest_soon: 'Sắp thu hoạch',
  empty: 'Đang trống',
  alert: 'Cảnh báo',
};

const agricultureStatusStyle: Record<AgricultureStatus, { fill: string; border: string; badge: string; dot: string }> = {
  growing: {
    fill: 'bg-[#16a34a]/25',
    border: 'border-[#16a34a]',
    badge: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
    dot: 'bg-[#16a34a]',
  },
  harvest_soon: {
    fill: 'bg-[#facc15]/30',
    border: 'border-[#eab308]',
    badge: 'border-[#fde68a] bg-[#fefce8] text-[#a16207]',
    dot: 'bg-[#eab308]',
  },
  empty: {
    fill: 'bg-[#9ca3af]/25',
    border: 'border-[#6b7280]',
    badge: 'border-[#d1d5db] bg-[#f9fafb] text-[#4b5563]',
    dot: 'bg-[#9ca3af]',
  },
  alert: {
    fill: 'bg-[#ef4444]/25',
    border: 'border-[#dc2626]',
    badge: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
    dot: 'bg-[#dc2626]',
  },
};

const mapEntities: MapEntity[] = [
  {
    id: 'vn',
    level: 'vietnam',
    name: 'Việt Nam',
    area: '331.212 km²',
    crop: 'Đa cây trồng',
    season: 'Vụ Đông Xuân 2026',
    status: 'growing',
    adminName: 'Toàn quốc',
    parcels: 1280,
    iot: 246,
    aiRisk: '8 vùng cần theo dõi',
    position: 'left-[23%] top-[15%] h-[34%] w-[24%]',
    shape: 'polygon(22% 8%, 85% 0%, 96% 42%, 70% 100%, 12% 84%, 0% 30%)',
    rotation: '-rotate-6',
  },
  {
    id: 'hcm',
    level: 'province',
    parentId: 'vn',
    name: 'TP. Hồ Chí Minh',
    area: '2.095 km²',
    crop: 'Rau ăn lá',
    season: 'Vụ Hè Thu 2026',
    status: 'growing',
    adminName: 'Củ Chi, Hóc Môn',
    parcels: 62,
    iot: 28,
    aiRisk: 'Ổn định',
    position: 'left-[14%] top-[18%] h-[18%] w-[23%]',
    shape: 'polygon(8% 18%, 88% 0%, 100% 58%, 80% 100%, 10% 82%, 0% 38%)',
    rotation: '-rotate-6',
  },
  {
    id: 'dong-nai',
    level: 'province',
    parentId: 'vn',
    name: 'Đồng Nai',
    area: '5.907 km²',
    crop: 'Sầu riêng',
    season: 'Niên vụ 2026',
    status: 'harvest_soon',
    adminName: 'Xuân Lộc, Long Khánh',
    parcels: 74,
    iot: 42,
    aiRisk: '2 cảnh báo năng suất',
    position: 'left-[45%] top-[32%] h-[19%] w-[28%]',
    shape: 'polygon(10% 0%, 92% 18%, 100% 72%, 78% 100%, 0% 78%)',
    rotation: 'rotate-6',
  },
  {
    id: 'long-an',
    level: 'province',
    parentId: 'vn',
    name: 'Long An',
    area: '4.492 km²',
    crop: 'Lúa',
    season: 'Vụ Đông Xuân 2026',
    status: 'alert',
    adminName: 'Đức Hòa, Tân An',
    parcels: 48,
    iot: 17,
    aiRisk: 'Cảnh báo NDVI thấp',
    position: 'left-[28%] top-[66%] h-[18%] w-[22%]',
    shape: 'polygon(12% 0%, 92% 14%, 100% 82%, 76% 100%, 0% 78%)',
    rotation: 'rotate-6',
  },
  {
    id: 'farm-cu-chi',
    level: 'farm',
    parentId: 'hcm',
    name: 'Farm rau Củ Chi',
    area: '38.4 ha',
    crop: 'Rau ăn lá',
    season: 'Vụ Hè Thu 2026',
    status: 'growing',
    adminName: 'Xã Phạm Văn Cội',
    parcels: 18,
    iot: 12,
    aiRisk: 'Ổn định',
    position: 'left-[20%] top-[20%] h-[21%] w-[26%]',
    shape: 'polygon(0% 18%, 88% 0%, 100% 78%, 70% 100%, 12% 84%)',
    rotation: '-rotate-3',
  },
  {
    id: 'farm-dong-nai',
    level: 'farm',
    parentId: 'dong-nai',
    name: 'Farm sầu riêng Xuân Lộc',
    area: '52.8 ha',
    crop: 'Sầu riêng',
    season: 'Niên vụ 2026',
    status: 'harvest_soon',
    adminName: 'Xã Xuân Lộc',
    parcels: 24,
    iot: 18,
    aiRisk: 'Dự báo thu hoạch 14 ngày',
    position: 'left-[43%] top-[27%] h-[24%] w-[31%]',
    shape: 'polygon(12% 0%, 92% 16%, 100% 78%, 80% 100%, 0% 76%)',
    rotation: 'rotate-4',
  },
  {
    id: 'parcel-hcm-001',
    level: 'parcel',
    parentId: 'farm-cu-chi',
    name: 'P-HCM-001',
    area: '2.45 ha',
    crop: 'Rau ăn lá',
    season: 'Vụ Hè Thu 2026',
    status: 'growing',
    adminName: 'Farm rau Củ Chi',
    parcels: 1,
    iot: 2,
    aiRisk: 'Không phát hiện sâu bệnh',
    position: 'left-[18%] top-[18%] h-[18%] w-[22%]',
    shape: 'polygon(8% 8%, 92% 0%, 100% 70%, 78% 100%, 0% 82%)',
    rotation: '-rotate-6',
  },
  {
    id: 'parcel-la-032',
    level: 'parcel',
    parentId: 'long-an',
    name: 'P-LA-032',
    area: '3.10 ha',
    crop: 'Lúa ST25',
    season: 'Vụ Đông Xuân 2026',
    status: 'alert',
    adminName: 'Vùng lúa Long An',
    parcels: 1,
    iot: 1,
    aiRisk: 'NDVI giảm 12%',
    position: 'left-[50%] top-[50%] h-[18%] w-[24%]',
    shape: 'polygon(10% 0%, 90% 18%, 100% 82%, 78% 100%, 0% 76%)',
    rotation: 'rotate-5',
  },
  {
    id: 'parcel-ct-001',
    level: 'parcel',
    parentId: 'long-an',
    name: 'P-CT-001',
    area: '2.45 ha',
    crop: 'LÃºa ST25',
    season: 'Vá»¥ ÄÃ´ng XuÃ¢n 2026',
    status: 'growing',
    adminName: 'Äá»“ng báº±ng sÃ´ng Cá»­u Long, Cáº§n ThÆ¡',
    parcels: 1,
    iot: 2,
    aiRisk: 'KhÃ´ng phÃ¡t hiá»‡n sÃ¢u bá»‡nh',
    position: 'left-[18%] top-[18%] h-[18%] w-[22%]',
    shape: 'polygon(8% 8%, 92% 0%, 100% 70%, 78% 100%, 0% 82%)',
    rotation: '-rotate-6',
    centroid: [105.804, 10.0175],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [105.7659, 10.0452],
        [105.8421, 10.0452],
        [105.8421, 9.9898],
        [105.7659, 9.9898],
        [105.7659, 10.0452],
      ]],
    },
  },
  {
    id: 'parcel-ct-002',
    level: 'parcel',
    parentId: 'long-an',
    name: 'P-CT-002',
    area: '2.82 ha',
    crop: 'LÃºa ST25',
    season: 'Vá»¥ ÄÃ´ng XuÃ¢n 2026',
    status: 'harvest_soon',
    adminName: 'Äá»“ng báº±ng sÃ´ng Cá»­u Long, Cáº§n ThÆ¡',
    parcels: 1,
    iot: 1,
    aiRisk: 'Dá»± bÃ¡o thu hoáº¡ch 10 ngÃ y',
    position: 'left-[50%] top-[50%] h-[18%] w-[24%]',
    shape: 'polygon(10% 0%, 90% 18%, 100% 82%, 78% 100%, 0% 76%)',
    rotation: 'rotate-5',
    centroid: [105.891, 10.0172],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [105.8530, 10.0450],
        [105.9292, 10.0447],
        [105.9288, 9.9895],
        [105.8528, 9.9897],
        [105.8530, 10.0450],
      ]],
    },
  },
  {
    id: 'parcel-ct-003',
    level: 'parcel',
    parentId: 'long-an',
    name: 'P-CT-003',
    area: '3.10 ha',
    crop: 'LÃºa ST25',
    season: 'Vá»¥ ÄÃ´ng XuÃ¢n 2026',
    status: 'alert',
    adminName: 'Äá»“ng báº±ng sÃ´ng Cá»­u Long, Cáº§n ThÆ¡',
    parcels: 1,
    iot: 1,
    aiRisk: 'NDVI giáº£m 12%',
    position: 'left-[50%] top-[50%] h-[18%] w-[24%]',
    shape: 'polygon(10% 0%, 90% 18%, 100% 82%, 78% 100%, 0% 76%)',
    rotation: 'rotate-5',
    centroid: [105.804, 9.9512],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [105.7662, 9.9788],
        [105.8420, 9.9786],
        [105.8415, 9.9235],
        [105.7657, 9.9237],
        [105.7662, 9.9788],
      ]],
    },
  },
];

function GisHeader({ active }: { active: GisSection }) {
  return (
    <div className="px-5 pb-0 pt-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#16a34a]">GIS</p>
          <h1 className="mt-1 text-[24px] font-extrabold leading-8">Bản đồ và vùng canh tác</h1>
          <p className="mt-1 text-xs text-[#687084]">Quản lý thửa đất, vùng nguyên liệu, lớp NDVI và dữ liệu bản đồ.</p>
        </div>
      </div>
      <div className="mt-5 flex border-b border-[#e1e4e8] pb-3">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e1e4e8] bg-[#f8fafc] p-1">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link
              className={`inline-flex h-9 min-w-[112px] items-center justify-center gap-2 rounded-md border px-3 text-xs font-bold transition ${
                isActive
                  ? 'border-[#16a34a] bg-white text-[#16a34a] shadow-sm'
                  : 'border-transparent text-[#334155] hover:border-[#d5d9df] hover:bg-white hover:text-[#16a34a]'
              }`}
              href={tab.href}
              key={tab.id}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="shrink-0" size={14} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function MiniMap({ selectedParcel }: { selectedParcel?: Parcel | null }) {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-[#d7dde3] bg-[#cdefff]">
      <div className="absolute left-[12%] top-[18%] h-24 w-40 rotate-[-8deg] rounded-[28px] border-2 border-[#16a34a] bg-[#16a34a]/25" />
      <div className="absolute left-[38%] top-[36%] h-28 w-48 rotate-[10deg] rounded-[32px] border-2 border-[#0891b2] bg-[#0891b2]/25" />
      <div className="absolute bottom-[16%] left-[20%] h-24 w-36 rotate-[7deg] rounded-[26px] border-2 border-[#f97316] bg-[#f97316]/20" />
      <div className="absolute right-[14%] top-[15%] rounded-md border border-[#d5d9df] bg-white p-2 shadow-sm">
        <button className="block h-7 w-7 text-lg font-bold" type="button">+</button>
        <button className="block h-7 w-7 text-lg font-bold" type="button">-</button>
      </div>
      <div className="absolute bottom-4 left-4 rounded-lg border border-[#d5d9df] bg-white p-3 text-xs shadow-sm">
        <p className="font-extrabold">{selectedParcel?.code ?? 'P-HCM-001'}</p>
        <p className="mt-1 text-[#687084]">{selectedParcel?.area ?? 2.45} ha · {selectedParcel?.crop ?? 'Rau ăn lá'}</p>
      </div>
    </div>
  );
}

function buildParcelCollection(entities: MapEntity[]): GeoJsonData {
  return {
    type: 'FeatureCollection',
    features: entities
      .filter((entity): entity is MapEntity & { geometry: PolygonGeometry } => Boolean(entity.geometry))
      .map((entity) => ({
        type: 'Feature',
        properties: {
          id: entity.id,
          name: entity.name,
          status: entity.status,
          crop: entity.crop,
        },
        geometry: entity.geometry,
      })),
  } as GeoJsonData;
}

function buildIotCollection(entities: MapEntity[]): GeoJsonData {
  return {
    type: 'FeatureCollection',
    features: entities
      .filter((entity): entity is MapEntity & { centroid: [number, number] } => Boolean(entity.centroid))
      .map((entity) => ({
        type: 'Feature',
        properties: {
          id: entity.id,
          name: entity.name,
        },
        geometry: {
          type: 'Point',
          coordinates: entity.centroid,
        },
      })),
  } as GeoJsonData;
}

function setGeoJsonSourceData(map: maplibregl.Map, sourceId: string, data: GeoJsonData) {
  const source = map.getSource(sourceId);
  if (source && 'setData' in source) {
    (source as maplibregl.GeoJSONSource).setData(data);
  }
}

function setLayerVisibility(map: maplibregl.Map, layerIds: string[], visible: boolean) {
  layerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }
  });
}

function GisMapCanvas({
  entities,
  layerState,
  onEntitySelect,
  selectedEntityId,
}: {
  entities: MapEntity[];
  layerState: MapLayerState;
  onEntitySelect: (entity: MapEntity) => void;
  selectedEntityId: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const entitiesRef = useRef(entities);
  const onEntitySelectRef = useRef(onEntitySelect);

  useEffect(() => {
    entitiesRef.current = entities;
    onEntitySelectRef.current = onEntitySelect;
  }, [entities, onEntitySelect]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: osmRasterStyle,
      center: VIETNAM_CENTER,
      zoom: VIETNAM_ZOOM,
    });

    mapRef.current = map;

    map.on('load', () => {
      loadedRef.current = true;

      map.addSource('nextfarm-parcels', {
        type: 'geojson',
        data: buildParcelCollection(entitiesRef.current),
      });

      map.addLayer({
        id: 'nextfarm-parcels-fill',
        type: 'fill',
        source: 'nextfarm-parcels',
        paint: {
          'fill-color': [
            'match',
            ['get', 'status'],
            'growing',
            '#16a34a',
            'harvest_soon',
            '#eab308',
            'alert',
            '#ef4444',
            'empty',
            '#9ca3af',
            '#16a34a',
          ],
          'fill-opacity': 0.42,
        },
      });

      map.addLayer({
        id: 'nextfarm-parcels-line',
        type: 'line',
        source: 'nextfarm-parcels',
        paint: {
          'line-color': '#14532d',
          'line-width': 4,
        },
      });

      map.addSource('nextfarm-iot', {
        type: 'geojson',
        data: buildIotCollection(entitiesRef.current),
      });

      map.addLayer({
        id: 'nextfarm-iot-points',
        type: 'circle',
        source: 'nextfarm-iot',
        paint: {
          'circle-color': '#0891b2',
          'circle-radius': 6,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      map.on('click', 'nextfarm-parcels-fill', (event) => {
        const feature = event.features?.[0];
        const id = feature?.properties?.id;
        const selected = entitiesRef.current.find((entity) => entity.id === id);
        if (selected) {
          onEntitySelectRef.current(selected);
        }
      });

      map.on('mouseenter', 'nextfarm-parcels-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'nextfarm-parcels-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      requestAnimationFrame(() => map.resize());
    });

    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    setGeoJsonSourceData(map, 'nextfarm-parcels', buildParcelCollection(entities));
    setGeoJsonSourceData(map, 'nextfarm-iot', buildIotCollection(entities));
    setLayerVisibility(map, ['nextfarm-parcels-fill', 'nextfarm-parcels-line'], layerState.farm);
    setLayerVisibility(map, ['nextfarm-iot-points'], layerState.iot);

    if (map.getLayer('nextfarm-parcels-line')) {
      map.setPaintProperty('nextfarm-parcels-line', 'line-color', [
        'case',
        ['==', ['get', 'id'], selectedEntityId],
        '#111827',
        '#14532d',
      ]);
      map.setPaintProperty('nextfarm-parcels-line', 'line-width', [
        'case',
        ['==', ['get', 'id'], selectedEntityId],
        6,
        4,
      ]);
    }
  }, [entities, layerState.farm, layerState.iot, selectedEntityId]);

  return <div className="absolute inset-0 h-full w-full" ref={mapContainerRef} />;
}

export function GisMapPage() {
  const [selectedEntity, setSelectedEntity] = useState<MapEntity>(mapEntities[0]);
  const [level, setLevel] = useState<DrillLevel>('vietnam');
  const [regionFilter, setRegionFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [layerState, setLayerState] = useState<MapLayerState>({ farm: true, iot: true, ai: true });

  const visibleMapEntities = useMemo(() => {
    return mapEntities.filter((entity) => {
      if (!entity.geometry) return false;

      const matchedRegion = regionFilter === 'all' || entity.id === regionFilter || entity.parentId === regionFilter || entity.adminName.includes(regionFilter);
      const matchedCrop = cropFilter === 'all' || entity.crop === cropFilter;
      const matchedSeason = seasonFilter === 'all' || entity.season === seasonFilter;
      const matchedStatus = statusFilter === 'all' || entity.status === statusFilter;
      return matchedRegion && matchedCrop && matchedSeason && matchedStatus;
    });
  }, [cropFilter, regionFilter, seasonFilter, statusFilter]);

  function resetLevel(nextLevel: DrillLevel) {
    const fallback = nextLevel === 'vietnam' ? mapEntities[0] : mapEntities.find((entity) => entity.level === nextLevel) ?? mapEntities[0];
    setLevel(nextLevel);
    setSelectedEntity(fallback);
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-white">
      <GisHeader active="map" />
      <div className="p-5">
        <section className="rounded-lg border border-[#e1e4e8] bg-white p-3">
          <div className="grid grid-cols-4 gap-3">
            <FilterSelect label="Khu vực" onChange={setRegionFilter} value={regionFilter}>
              <option value="all">Tất cả khu vực</option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="dong-nai">Đồng Nai</option>
              <option value="long-an">Long An</option>
            </FilterSelect>
            <FilterSelect label="Cây trồng" onChange={setCropFilter} value={cropFilter}>
              <option value="all">Tất cả cây trồng</option>
              <option value="Rau ăn lá">Rau ăn lá</option>
              <option value="Sầu riêng">Sầu riêng</option>
              <option value="Lúa">Lúa</option>
              <option value="Lúa ST25">Lúa ST25</option>
            </FilterSelect>
            <FilterSelect label="Mùa vụ" onChange={setSeasonFilter} value={seasonFilter}>
              <option value="all">Tất cả mùa vụ</option>
              <option value="Vụ Đông Xuân 2026">Vụ Đông Xuân 2026</option>
              <option value="Vụ Hè Thu 2026">Vụ Hè Thu 2026</option>
              <option value="Niên vụ 2026">Niên vụ 2026</option>
            </FilterSelect>
            <FilterSelect label="Trạng thái" onChange={setStatusFilter} value={statusFilter}>
              <option value="all">Tất cả trạng thái</option>
              <option value="growing">Đang trồng</option>
              <option value="harvest_soon">Sắp thu hoạch</option>
              <option value="empty">Đang trống</option>
              <option value="alert">Cảnh báo</option>
            </FilterSelect>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_340px] gap-4">
          <section className="relative h-[590px] overflow-hidden rounded-lg border border-[#d7dde3] bg-[#cdefff]">
            <GisMapCanvas
              entities={visibleMapEntities}
              layerState={layerState}
              onEntitySelect={setSelectedEntity}
              selectedEntityId={selectedEntity.id}
            />

            <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-[#d5d9df] bg-white/95 px-3 py-2 text-xs font-bold shadow-sm">
              <button className="text-[#16a34a]" onClick={() => resetLevel('vietnam')} type="button">Việt Nam</button>
              <ChevronRight size={13} />
              <button className={level !== 'vietnam' ? 'text-[#16a34a]' : 'text-[#687084]'} onClick={() => resetLevel('province')} type="button">Tỉnh</button>
              <ChevronRight size={13} />
              <button className={level === 'farm' || level === 'parcel' ? 'text-[#16a34a]' : 'text-[#687084]'} onClick={() => resetLevel('farm')} type="button">Farm</button>
              <ChevronRight size={13} />
              <span className={level === 'parcel' ? 'text-[#16a34a]' : 'text-[#687084]'}>Thửa</span>
            </div>

            <div className="absolute right-4 top-4 z-20 grid overflow-hidden rounded-md border border-[#d5d9df] bg-white shadow-sm">
              <button className="h-9 w-9 text-lg font-extrabold" onClick={() => setLevel(level === 'vietnam' ? 'province' : level === 'province' ? 'farm' : 'parcel')} type="button">+</button>
              <button className="h-9 w-9 border-t border-[#e1e4e8] text-lg font-extrabold" onClick={() => setLevel(level === 'parcel' ? 'farm' : level === 'farm' ? 'province' : 'vietnam')} type="button">-</button>
            </div>

            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
              {[
                ['farm', 'Farm', layerState.farm],
                ['iot', 'IoT', layerState.iot],
                ['ai', 'AI heatmap', layerState.ai],
              ].map(([key, label, checked]) => (
                <label className="flex h-8 items-center gap-2 rounded-md border border-[#d5d9df] bg-white/95 px-3 text-xs font-bold shadow-sm" key={String(key)}>
                  <input checked={Boolean(checked)} className="h-3 w-3 accent-[#16a34a]" onChange={() => setLayerState((current) => ({ ...current, [String(key)]: !current[String(key) as keyof typeof current] }))} type="checkbox" />
                  {label}
                </label>
              ))}
            </div>

            <div className="absolute bottom-4 right-4 z-20 rounded-lg border border-[#d5d9df] bg-white/95 p-3 text-xs shadow-sm">
              <p className="font-extrabold">Chú giải trạng thái</p>
              <div className="mt-2 grid gap-2">
                {Object.entries(agricultureStatusLabel).map(([key, label]) => (
                  <div className="flex items-center gap-2" key={key}>
                    <span className={`h-2.5 w-2.5 rounded-full ${agricultureStatusStyle[key as AgricultureStatus].dot}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <GisDetailPanel entity={selectedEntity} />
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-[11px] font-bold">
      {label}
      <select className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
    </label>
  );
}

function GisDetailPanel({ entity }: { entity: MapEntity }) {
  const status = agricultureStatusStyle[entity.status];

  return (
    <aside className="rounded-lg border border-[#e1e4e8] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#16a34a]">{entity.level === 'province' ? 'Vùng hành chính' : entity.level === 'farm' ? 'Farm' : entity.level === 'parcel' ? 'Thửa đất' : 'Quốc gia'}</p>
          <h2 className="mt-1 text-lg font-extrabold">{entity.name}</h2>
          <p className="mt-1 text-xs text-[#687084]">{entity.adminName}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${status.badge}`}>{agricultureStatusLabel[entity.status]}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Diện tích" value={entity.area} />
        <StatCard label="Số thửa" value={String(entity.parcels)} />
        <StatCard label="IoT" value={`${entity.iot} thiết bị`} />
        <StatCard label="AI" value={entity.aiRisk} />
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        {[
          ['Cây trồng', entity.crop],
          ['Mùa vụ', entity.season],
          ['Cấp hiện tại', entity.level === 'vietnam' ? 'Việt Nam' : entity.level === 'province' ? 'Tỉnh/Huyện' : entity.level === 'farm' ? 'Farm' : 'Thửa'],
        ].map(([label, value]) => (
          <div className="flex justify-between border-b border-[#e1e4e8] pb-2" key={label}>
            <span className="text-[#687084]">{label}</span>
            <span className="font-bold text-right">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-[#bae6fd] bg-[#f0f9ff] px-3 py-3 text-[11px] leading-5 text-[#0369a1]">
        Click vùng trên bản đồ để drill-down nhiều cấp. GIS là trung tâm điều hướng sang mùa vụ, thu hoạch, IoT và AI theo vùng đang chọn.
      </div>

      <div className="mt-4 grid gap-2">
        <Link className="flex h-9 items-center justify-between rounded-md border border-[#d5d9df] px-3 text-xs font-bold hover:bg-[#f8fafc]" href="/process/tasks/">
          <span className="flex items-center gap-2"><Wheat size={14} /> Mở mùa vụ</span>
          <ChevronRight size={14} />
        </Link>
        <Link className="flex h-9 items-center justify-between rounded-md border border-[#d5d9df] px-3 text-xs font-bold hover:bg-[#f8fafc]" href="/harvest/">
          <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Thu hoạch</span>
          <ChevronRight size={14} />
        </Link>
        <Link className="flex h-9 items-center justify-between rounded-md border border-[#d5d9df] px-3 text-xs font-bold hover:bg-[#f8fafc]" href="/iot/dashboard/">
          <span className="flex items-center gap-2"><Cpu size={14} /> IoT & cảm biến</span>
          <ChevronRight size={14} />
        </Link>
        <Link className="flex h-9 items-center justify-between rounded-md border border-[#d5d9df] px-3 text-xs font-bold hover:bg-[#f8fafc]" href="/ai/chat/">
          <span className="flex items-center gap-2"><Bot size={14} /> Phân tích AI</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {entity.status === 'alert' ? (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-3 text-[11px] font-bold text-[#dc2626]">
          <AlertTriangle size={15} />
          Có cảnh báo cần kiểm tra tại vùng này.
        </div>
      ) : null}
    </aside>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e1e4e8] bg-white p-3">
      <p className="text-[11px] text-[#687084]">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

export function GisParcelsPage() {
  const [parcels, setParcels] = useState(initialParcels);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(initialParcels[0]);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredParcels = useMemo(() => {
    return parcels.filter((parcel) => {
      const keyword = search.trim().toLowerCase();
      const matchedKeyword = !keyword || [parcel.code, parcel.zone, parcel.farmer, parcel.crop].some((value) => value.toLowerCase().includes(keyword));
      const matchedStatus = status === 'all' || parcel.status === status;
      return matchedKeyword && matchedStatus;
    });
  }, [parcels, search, status]);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-white">
      <GisHeader active="parcels" />
      <div className="grid grid-cols-[minmax(620px,1fr)_390px] gap-4 p-5">
        <section className="rounded-lg border border-[#e1e4e8] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-8 w-9 items-center justify-center rounded-md border border-[#d5d9df] bg-[#f3f4f6]">
                <Search size={15} className="text-[#687084]" />
              </div>
              <input className="h-8 flex-1 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo mã thửa, vùng, nông dân, cây trồng" value={search} />
              <select className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setStatus(event.target.value)} value={status}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang canh tác</option>
                <option value="draft">Nháp</option>
                <option value="abandoned">Ngừng canh tác</option>
              </select>
            </div>
            <button className="flex h-8 items-center gap-2 rounded-md bg-[#16a34a] px-3 text-xs font-bold text-white" onClick={() => setCreateOpen(true)} type="button">
              <Plus size={14} />
              Tạo thửa đất
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="bg-[#f3f3f5] text-[#687084]">
                <tr>
                  <th className="px-3 py-[10px] font-medium">Mã thửa</th>
                  <th className="px-3 py-[10px] font-medium">Diện tích</th>
                  <th className="px-3 py-[10px] font-medium">Vùng</th>
                  <th className="px-3 py-[10px] font-medium">Nông dân</th>
                  <th className="px-3 py-[10px] font-medium">Cây trồng</th>
                  <th className="px-3 py-[10px] font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map((parcel) => (
                  <tr className="cursor-pointer border-b border-[#e1e4e8] hover:bg-[#f8fafc]" key={parcel.id} onClick={() => setSelectedParcel(parcel)}>
                    <td className="px-3 py-[11px] font-extrabold">{parcel.code}</td>
                    <td className="px-3 py-[11px]">{parcel.area} ha</td>
                    <td className="px-3 py-[11px]">{parcel.zone}</td>
                    <td className="px-3 py-[11px]">{parcel.farmer}</td>
                    <td className="px-3 py-[11px]">{parcel.crop}</td>
                    <td className="px-3 py-[11px]"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass[parcel.status]}`}>{statusLabel[parcel.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <ParcelDetail parcel={selectedParcel} onDelete={(id) => setParcels((current) => current.filter((parcel) => parcel.id !== id))} />
      </div>
      {createOpen ? <CreateParcelModal onClose={() => setCreateOpen(false)} onCreate={(parcel) => { setParcels((current) => [parcel, ...current]); setSelectedParcel(parcel); setCreateOpen(false); }} /> : null}
    </section>
  );
}

function ParcelDetail({ parcel, onDelete }: { parcel: Parcel | null; onDelete: (id: string) => void }) {
  if (!parcel) return null;

  return (
    <aside className="rounded-lg border border-[#e1e4e8] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold">Chi tiết thửa đất</h2>
          <p className="mt-1 text-xs text-[#687084]">{parcel.code}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d5d9df]" type="button"><Pencil size={14} /></button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-[#fecaca] text-[#dc2626]" onClick={() => onDelete(parcel.id)} type="button"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="mt-4"><MiniMap selectedParcel={parcel} /></div>
      <div className="mt-4 grid gap-3 text-xs">
        {[
          ['Diện tích', `${parcel.area} ha`],
          ['Vùng', parcel.zone],
          ['Nông dân', parcel.farmer],
          ['Cây trồng', parcel.crop],
          ['NDVI', parcel.ndvi],
          ['Trạng thái', statusLabel[parcel.status]],
        ].map(([label, value]) => (
          <div className="flex justify-between border-b border-[#e1e4e8] pb-2" key={label}>
            <span className="text-[#687084]">{label}</span>
            <span className="font-bold">{value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function CreateParcelModal({ onClose, onCreate }: { onClose: () => void; onCreate: (parcel: Parcel) => void }) {
  const [code, setCode] = useState('P-NEW-001');
  const [zone, setZone] = useState(zones[0].name);
  const [crop, setCrop] = useState('Rau ăn lá');
  const [farmer, setFarmer] = useState('Nguyễn Văn An');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <section className="w-[760px] overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex h-[52px] items-center justify-between border-b border-[#e1e4e8] px-4">
          <h2 className="text-sm font-extrabold">Tạo thửa đất mới</h2>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-[320px_1fr] gap-4 p-4">
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            onCreate({ id: `p-${Date.now()}`, code, area: 2.2, zone, farmer, crop, status: 'draft', ndvi: 'Chưa quét' });
          }}>
            <Field label="Mã thửa đất"><input className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setCode(event.target.value)} value={code} /></Field>
            <Field label="Vùng canh tác"><select className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setZone(event.target.value)} value={zone}>{zones.map((item) => <option key={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Nông dân phụ trách"><input className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setFarmer(event.target.value)} value={farmer} /></Field>
            <Field label="Cây trồng"><input className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setCrop(event.target.value)} value={crop} /></Field>
            <div className="rounded-md border border-[#bae6fd] bg-[#f0f9ff] px-3 py-2 text-[11px] text-[#0369a1]">Có thể vẽ polygon trực tiếp trên bản đồ hoặc dán GeoJSON. Diện tích sẽ được hệ thống tính lại từ boundary.</div>
            <div className="mt-2 flex justify-end gap-2 border-t border-[#e1e4e8] pt-4">
              <button className="h-8 rounded-md border border-[#d5d9df] px-4 text-xs font-bold" onClick={onClose} type="button">Hủy</button>
              <button className="h-8 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" type="submit">Lưu thửa đất</button>
            </div>
          </form>
          <MiniMap />
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-[11px] font-bold">{label}{children}</label>;
}

export function GisZonesPage() {
  const [zoneItems, setZoneItems] = useState(zones);
  const [selectedZone, setSelectedZone] = useState(zones[0]);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-white">
      <GisHeader active="zones" />
      <div className="grid grid-cols-[minmax(560px,1fr)_420px] gap-4 p-5">
        <section className="rounded-lg border border-[#e1e4e8] bg-white p-4">
          <div className="flex justify-between">
            <h2 className="text-sm font-extrabold">Danh sách vùng canh tác</h2>
            <button className="flex h-8 items-center gap-2 rounded-md bg-[#16a34a] px-3 text-xs font-bold text-white" onClick={() => setCreateOpen(true)} type="button"><Plus size={14} />Tạo vùng</button>
          </div>
          <div className="mt-4 grid gap-3">
            {zoneItems.map((zone) => (
              <button className={`rounded-lg border p-4 text-left ${selectedZone.id === zone.id ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e1e4e8] hover:bg-[#f8fafc]'}`} key={zone.id} onClick={() => setSelectedZone(zone)} type="button">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold">{zone.name}</p>
                    <p className="mt-1 text-xs text-[#687084]">{zone.level} · {zone.mainCrop}</p>
                  </div>
                  <ChevronRight size={16} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <StatInline label="Diện tích" value={`${zone.area} ha`} />
                  <StatInline label="Thửa đất" value={`${zone.parcels}`} />
                  <StatInline label="Trạng thái" value={zone.status} />
                </div>
              </button>
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-[#e1e4e8] bg-white p-4">
          <h2 className="text-base font-extrabold">{selectedZone.name}</h2>
          <p className="mt-1 text-xs text-[#687084]">Thống kê vùng nguyên liệu được tính lại bất đồng bộ khi thửa đất thay đổi.</p>
          <div className="mt-4"><MiniMap /></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard label="Tổng diện tích" value={`${selectedZone.area} ha`} />
            <StatCard label="Số thửa" value={`${selectedZone.parcels}`} />
            <StatCard label="Cây chủ lực" value={selectedZone.mainCrop} />
            <StatCard label="Trạng thái" value={selectedZone.status} />
          </div>
        </aside>
      </div>
      {createOpen ? (
        <CreateZoneModal
          onClose={() => setCreateOpen(false)}
          onCreate={(zone) => {
            setZoneItems((current) => [zone, ...current]);
            setSelectedZone(zone);
            setCreateOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

function CreateZoneModal({ onClose, onCreate }: { onClose: () => void; onCreate: (zone: Zone) => void }) {
  const [name, setName] = useState('Vùng canh tác mới');
  const [level, setLevel] = useState('Huyện');
  const [mainCrop, setMainCrop] = useState('Rau ăn lá');
  const [area, setArea] = useState('12.5');
  const [boundaryMode, setBoundaryMode] = useState<'draw' | 'geojson'>('draw');
  const [geojson, setGeojson] = useState('{\n  "type": "Polygon",\n  "coordinates": []\n}');
  const [error, setError] = useState('');

  function slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
      <section className="w-[920px] overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex h-[52px] items-center justify-between border-b border-[#e1e4e8] px-4">
          <div>
            <h2 className="text-sm font-extrabold">Tạo vùng canh tác mới</h2>
            <p className="mt-1 text-[11px] text-[#687084]">Vùng có boundary polygon và thống kê sẽ được tính lại sau khi lưu.</p>
          </div>
          <button onClick={onClose} type="button"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-[360px_1fr] gap-4 p-4">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const finalArea = Number(area);

              if (!name.trim() || !level || !mainCrop.trim() || Number.isNaN(finalArea) || finalArea <= 0) {
                setError('Vui lòng nhập đầy đủ tên vùng, cấp hành chính, cây chủ lực và diện tích hợp lệ.');
                return;
              }

              if (boundaryMode === 'geojson' && !geojson.includes('Polygon')) {
                setError('GeoJSON cần có kiểu Polygon.');
                return;
              }

              onCreate({
                id: `z-${slugify(name)}-${Date.now()}`,
                name: name.trim(),
                level,
                area: finalArea,
                parcels: 0,
                mainCrop: mainCrop.trim(),
                status: 'Mới tạo',
              });
            }}
          >
            <Field label="Tên vùng *">
              <input className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => { setName(event.target.value); setError(''); }} value={name} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cấp hành chính *">
                <select className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setLevel(event.target.value)} value={level}>
                  <option>Tỉnh</option>
                  <option>Huyện</option>
                  <option>Xã</option>
                  <option>Vùng nội bộ</option>
                </select>
              </Field>
              <Field label="Diện tích dự kiến (ha) *">
                <input className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setArea(event.target.value)} type="number" value={area} />
              </Field>
            </div>
            <Field label="Cây chủ lực *">
              <input className="h-8 rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 text-xs outline-none" onChange={(event) => setMainCrop(event.target.value)} value={mainCrop} />
            </Field>
            <div className="grid gap-2 text-[11px] font-bold">
              Boundary vùng
              <div className="grid grid-cols-2 gap-2">
                <button className={`h-8 rounded-md border text-xs font-bold ${boundaryMode === 'draw' ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#d5d9df]'}`} onClick={() => setBoundaryMode('draw')} type="button">Vẽ trên bản đồ</button>
                <button className={`h-8 rounded-md border text-xs font-bold ${boundaryMode === 'geojson' ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#d5d9df]'}`} onClick={() => setBoundaryMode('geojson')} type="button">Dán GeoJSON</button>
              </div>
            </div>
            {boundaryMode === 'geojson' ? (
              <textarea className="min-h-[120px] rounded-md border border-[#d5d9df] bg-[#f3f4f6] px-3 py-2 font-mono text-[11px] outline-none" onChange={(event) => setGeojson(event.target.value)} value={geojson} />
            ) : (
              <div className="rounded-md border border-[#bae6fd] bg-[#f0f9ff] px-3 py-3 text-[11px] leading-5 text-[#0369a1]">
                Chọn công cụ vẽ polygon trên bản đồ bên phải. Hệ thống sẽ lưu boundary dạng geography(Polygon, 4326) và tính lại diện tích.
              </div>
            )}
            {error ? <p className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[11px] font-bold text-[#dc2626]">{error}</p> : null}
            <div className="mt-2 flex justify-end gap-2 border-t border-[#e1e4e8] pt-4">
              <button className="h-8 rounded-md border border-[#d5d9df] px-4 text-xs font-bold" onClick={onClose} type="button">Hủy</button>
              <button className="h-8 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" type="submit">Tạo vùng</button>
            </div>
          </form>
          <div>
            <MiniMap />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <StatInline label="Polygon" value="1" />
              <StatInline label="Thửa gán" value="0" />
              <StatInline label="Trạng thái" value="Mới tạo" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e1e4e8] bg-white px-3 py-2">
      <p className="text-[10px] text-[#687084]">{label}</p>
      <p className="mt-1 font-extrabold">{value}</p>
    </div>
  );
}

export function GisImportPage() {
  return (
    <section className="min-h-[calc(100vh-45px)] bg-white">
      <GisHeader active="import" />
      <div className="grid grid-cols-[420px_1fr] gap-4 p-5">
        <section className="rounded-lg border border-[#e1e4e8] bg-white p-4">
          <h2 className="text-sm font-extrabold">Nhập thửa đất hàng loạt</h2>
          <p className="mt-1 text-xs text-[#687084]">Hỗ trợ Shapefile hoặc GeoJSON, tối đa 500 thửa mỗi lần nhập.</p>
          <div className="mt-4 rounded-lg border-2 border-dashed border-[#d5d9df] bg-[#f8fafc] p-8 text-center">
            <Upload className="mx-auto text-[#16a34a]" size={28} />
            <p className="mt-3 text-sm font-extrabold">Kéo thả file vào đây</p>
            <p className="mt-1 text-xs text-[#687084]">.shp + .dbf/.shx hoặc .geojson</p>
            <button className="mt-4 h-8 rounded-md bg-[#16a34a] px-4 text-xs font-bold text-white" type="button">Chọn file</button>
          </div>
          <div className="mt-4 rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-3 text-xs text-[#15803d]">
            <p className="font-extrabold">Báo cáo kiểm tra</p>
            <p className="mt-1">128 polygon hợp lệ, 2 polygon cần sửa boundary, 0 mã thửa bị trùng.</p>
          </div>
        </section>
        <section className="rounded-lg border border-[#e1e4e8] bg-white p-4">
          <h2 className="text-sm font-extrabold">Xem trước dữ liệu</h2>
          <div className="mt-4"><MiniMap /></div>
          <div className="mt-4 grid gap-2">
            {['Kiểm tra ST_IsValid cho từng polygon', 'Bỏ qua polygon lỗi và xuất file báo cáo', 'Xác nhận nhập dữ liệu và phát event ParcelCreated'].map((text) => (
              <div className="flex items-center gap-2 text-xs font-bold" key={text}>
                <CheckCircle2 className="text-[#16a34a]" size={15} />
                {text}
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export function GisLayersPage() {
  const [items, setItems] = useState(layers);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-white">
      <GisHeader active="layers" />
      <div className="p-5">
        <section className="rounded-lg border border-[#e1e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold">Quản lý lớp bản đồ</h2>
              <p className="mt-1 text-xs text-[#687084]">Cấu hình lớp GeoServer, WMS/WMTS và lớp GeoJSON của hệ thống.</p>
            </div>
            <button className="flex h-8 items-center gap-2 rounded-md bg-[#16a34a] px-3 text-xs font-bold text-white" type="button"><Plus size={14} />Thêm lớp</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse text-left text-xs">
              <thead className="bg-[#f3f3f5] text-[#687084]">
                <tr>
                  <th className="px-3 py-[10px] font-medium">Tên lớp</th>
                  <th className="px-3 py-[10px] font-medium">Loại</th>
                  <th className="px-3 py-[10px] font-medium">Nguồn</th>
                  <th className="px-3 py-[10px] font-medium">Cập nhật</th>
                  <th className="px-3 py-[10px] text-right font-medium">Hiển thị</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr className="border-b border-[#e1e4e8]" key={item.id}>
                    <td className="px-3 py-[12px] font-extrabold">{item.name}</td>
                    <td className="px-3 py-[12px]">{item.type}</td>
                    <td className="px-3 py-[12px]">{item.source}</td>
                    <td className="px-3 py-[12px] text-[#687084]">{item.updatedAt}</td>
                    <td className="px-3 py-[12px] text-right">
                      <input checked={item.enabled} className="h-4 w-4 accent-[#16a34a]" onChange={() => setItems((current) => current.map((layer) => layer.id === item.id ? { ...layer, enabled: !layer.enabled } : layer))} type="checkbox" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
