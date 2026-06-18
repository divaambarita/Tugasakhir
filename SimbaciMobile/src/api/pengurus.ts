import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type PengurusRow = {
  idPengurus: number;
  namaPengurus?: string | null;
  nama?: string | null;
  jabatan?: string | null;
  noTelp?: string | null;
  jenisKelamin?: string | null;
  email?: string | null;
  alamat?: string | null;
  tempatLahir?: string | null;
  tglLahir?: string;
  pekerjaan?: string | null;
  ktp?: string | null;
  createdAt?: string;
  bsuId?: number | null;
  bsu?: {
    idBsu: number;
    nama?: string | null;
    status?: string | null;
  };
};

export async function getPengurusByBsu(
  token: string,
  idBsu: number,
): Promise<ApiResponse<PengurusRow[]>> {
  return apiRequest<PengurusRow[]>('/api/bsu/pengurus/getPengurus', {
    method: 'POST',
    token,
    body: {idBsu},
  });
}

export async function getPengurusDetail(
  token: string,
  idPengurus: number,
): Promise<ApiResponse<PengurusRow>> {
  return apiRequest<PengurusRow>(`/api/bsu/pengurus/${idPengurus}`, {
    method: 'GET',
    token,
  });
}

export type UpsertPengurusRequest = {
  idPengurus?: number;
  bsuId: number;
  namaPengurus: string;
  email?: string | null;
  jenisKelamin?: 'Male' | 'Female' | string | null;
  noTelp: string;
  alamat?: string | null;
  tempatLahir: string;
  tglLahir: string;
  pekerjaan?: string | null;
  jabatan: string;
  ktp?: string | null;
};

export async function upsertPengurus(
  token: string,
  payload: UpsertPengurusRequest,
): Promise<ApiResponse<PengurusRow>> {
  return apiRequest<PengurusRow>('/api/bsu/pengurus/storePengurus', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function deletePengurus(
  token: string,
  idPengurus: number,
): Promise<ApiResponse<never>> {
  return apiRequest<never>(`/api/bsu/pengurus/${idPengurus}`, {
    method: 'DELETE',
    token,
  });
}
