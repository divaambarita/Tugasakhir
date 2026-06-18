import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type PenarikanRow = {
  idPenarikan: number;
  nasabahId: number;
  tanggalPenarikan: string;
  totalPenarikan: number;
  metodePembayaran: string;
  statusKonfirmasi?: string | null;
  tanggalKonfirmasi?: string | null;
  createdAt?: string;
  nasabah?: {
    nama?: string | null;
    bsuId?: number | null;
  } | null;
};

export type CreatePenarikanRequest = {
  nasabahId: number;
  totalPenarikan: string;
  metodePembayaran: string;
  tanggalPenarikan: string;
  statusKonfirmasi?: string;
};

export async function getPenarikanByBsu(
  token: string,
  bsuId: number,
): Promise<ApiResponse<PenarikanRow[]>> {
  return apiRequest<PenarikanRow[]>(
    `/api/penarikan/storePenarikan?bsuId=${encodeURIComponent(String(bsuId))}`,
    {
      method: 'GET',
      token,
    },
  );
}

export async function getPenarikanByNasabah(
  token: string,
  nasabahId: number,
): Promise<ApiResponse<PenarikanRow[]>> {
  return apiRequest<PenarikanRow[]>(
    `/api/penarikan/storePenarikan?nasabahId=${encodeURIComponent(
      String(nasabahId),
    )}`,
    {
      method: 'GET',
      token,
    },
  );
}

export async function createPenarikan(
  token: string,
  payload: CreatePenarikanRequest,
): Promise<ApiResponse<PenarikanRow>> {
  return apiRequest<PenarikanRow>('/api/penarikan/storePenarikan', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function getPenarikanRequestsAdmin(
  token: string,
): Promise<ApiResponse<PenarikanRow[]>> {
  return apiRequest<PenarikanRow[]>('/api/penarikan/request/getRequest', {
    method: 'GET',
    token,
  });
}

export async function getPenarikanRequestsByBsu(
  token: string,
  idBsu: number,
): Promise<ApiResponse<PenarikanRow[]>> {
  return apiRequest<PenarikanRow[]>('/api/penarikan/request/getRequest', {
    method: 'POST',
    token,
    body: {idBsu: String(idBsu)},
  });
}

export type UpdatePenarikanStatusRequest = {
  statusKonfirmasi: 'Berhasil' | 'Ditolak';
};

export async function updatePenarikanStatus(
  token: string,
  idPenarikan: number,
  payload: UpdatePenarikanStatusRequest,
): Promise<ApiResponse<PenarikanRow>> {
  return apiRequest<PenarikanRow>(`/api/penarikan/request/${idPenarikan}`, {
    method: 'POST',
    token,
    body: payload,
  });
}
