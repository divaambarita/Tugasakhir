import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type JenisSampahRow = {
  idJenisSampah: number;
  nama: string;
  kategori: string;
  hargasampahbsi?: number | string | null;
  hargasampahbsu?: number | string | null;
  lastUpdate?: string | null;
};

export type JenisSampahGetDataResponse = {
  bsi: JenisSampahRow[];
  bsu: JenisSampahRow[];
};

export type CreateJenisSampahRequest = {
  nama: string;
  kategori: string;
  hargaBsi: number | null;
};

export type UpsertHargaSampahBsuRequest = {
  idJenisSampah: number;
  bsuId: number;
  nama: string;
  kategori: string;
  hargaBsi: number | null;
  hargaBsu: number;
};

export type UpdateJenisSampahRequest = CreateJenisSampahRequest & {
  idJenisSampah: number;
};

export async function getJenisSampahData(
  token: string,
  id: number,
): Promise<ApiResponse<JenisSampahGetDataResponse>> {
  return apiRequest<JenisSampahGetDataResponse>(
    `/api/jenisSampah/getData/${id}`,
    {
      method: 'GET',
      token,
    },
  );
}

export async function createJenisSampah(
  token: string,
  payload: CreateJenisSampahRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/jenisSampah/store', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateJenisSampah(
  token: string,
  payload: UpdateJenisSampahRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/jenisSampah/store', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function upsertHargaSampahBsu(
  token: string,
  payload: UpsertHargaSampahBsuRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/jenisSampah/store', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function deleteJenisSampah(
  token: string,
  idJenisSampah: number,
  bsuId?: number,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/jenisSampah/delete', {
    method: 'DELETE',
    token,
    body: bsuId ? {idJenisSampah, bsuId} : {idJenisSampah},
  });
}
