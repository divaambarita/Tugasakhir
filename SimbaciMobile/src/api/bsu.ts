import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type BsuAdminRow = {
  idBsu: number;
  nama?: string | null;
  noTelp?: string | null;
  email?: string | null;
  alamat?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  status?: string | null;
  isActive?: number | null;
  createdAt?: string;
  updatedAt?: string;
  foto?: string | null;
};

export type BsuAdminDetail = BsuAdminRow & {
  jadwal?: unknown;
  keteranganApprover?: string | null;
  pengurus?: unknown[];
  nasabah?: unknown[];
};

export type UpdateBsuAdminRequest = {
  idBsu: number;
  nama: string;
  email: string | null;
  noTelp: string;
  alamat: string | null;
  kecamatan: string | null;
  kelurahan: string | null;
  foto: string | null;
  roleId: number;
  saldo: number | null;
};

export type BsuJadwalHariItem = {
  key: string;
  nama: string;
  value: boolean;
};

export type UpdateBsuProfileRequest = {
  idAkun: number;
  noTelp: string;
  nama: string;
  alamat: string;
  foto?: string | null;
  jadwal: {
    hari: string; // JSON.stringify(BsuJadwalHariItem[])
    jamMulai: string; // HH:mm
    jamSelesai: string; // HH:mm
    bsuId: number;
  };
};

export async function getBsuAdminList(
  token: string,
): Promise<ApiResponse<BsuAdminRow[]>> {
  return apiRequest<BsuAdminRow[]>('/api/bsu/getDataBsu', {
    method: 'GET',
    token,
  });
}

export async function getBsuAdminDetail(
  token: string,
  idBsu: number,
): Promise<ApiResponse<BsuAdminDetail | null>> {
  return apiRequest<BsuAdminDetail | null>(`/api/bsu/${idBsu}`, {
    method: 'GET',
    token,
  });
}

export async function updateBsuAdmin(
  token: string,
  payload: UpdateBsuAdminRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/bsu/updateBsu', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function deleteBsuAdmin(
  token: string,
  idBsu: number,
): Promise<ApiResponse<never>> {
  return apiRequest<never>(`/api/bsu/${idBsu}`, {
    method: 'DELETE',
    token,
  });
}

export async function updateBsuProfile(
  token: string,
  payload: UpdateBsuProfileRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/updateProfile', {
    method: 'POST',
    token,
    body: payload,
  });
}
