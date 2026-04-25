import { api } from './client';
import type { PagedRequest, PagedResult } from '@/types/api';
import type { ParcelDto, ZoneDto } from '@/types/gis';

export const gisParcels = {
  list: (params: PagedRequest) =>
    api.get('api/v1/gis/parcels', { searchParams: cleanParams(params) }).json<PagedResult<ParcelDto>>(),
  get: (id: string) => api.get(`api/v1/gis/parcels/${id}`).json<ParcelDto>(),
};

export const gisZones = {
  list: (params: PagedRequest) =>
    api.get('api/v1/gis/zones', { searchParams: cleanParams(params) }).json<PagedResult<ZoneDto>>(),
};

function cleanParams(params: PagedRequest): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)]),
  );
}
