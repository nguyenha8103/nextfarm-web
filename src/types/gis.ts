export interface ParcelDto {
  id: string;
  code: string;
  name: string;
  areaHa: number;
  status: string;
}

export interface ZoneDto {
  id: string;
  code: string;
  cropType: string;
  parcelCount: number;
  status: string;
}
