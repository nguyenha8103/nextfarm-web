import { create } from 'zustand';

interface MapState {
  center: [number, number];
  zoom: number;
  selectedParcelId: string | null;
  visibleLayers: string[];
  setCenter: (center: [number, number]) => void;
  selectParcel: (id: string | null) => void;
  toggleLayer: (layerId: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [108.2772, 14.0583],
  zoom: 6,
  selectedParcelId: null,
  visibleLayers: ['parcels', 'zones'],
  setCenter: (center) => set({ center }),
  selectParcel: (id) => set({ selectedParcelId: id }),
  toggleLayer: (layerId) =>
    set((state) => ({
      visibleLayers: state.visibleLayers.includes(layerId)
        ? state.visibleLayers.filter((item) => item !== layerId)
        : [...state.visibleLayers, layerId],
    })),
}));
