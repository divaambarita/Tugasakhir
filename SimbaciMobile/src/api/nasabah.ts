import type {ApiResponse} from './types';
import {apiRequest} from './client';

export type NasabahBase = {
  idNasabah: number;
  nomorNasabah: string;
  nama: string;
  noTelp: string;
  saldo?: number | null;
  bsuId: number;
  createdAt: string;
};

export type NasabahDetail = NasabahBase & {
  email?: string | null;
  jenisKelamin?: string | null;
  Nik?: string | null;
  alamat?: string | null;
  tempatLahir?: string | null;
  tglLahir?: string;
  kelurahan?: string | null;
  kecamatan?: string | null;
  bsu?: {
    idBsu: number;
    nama?: string | null;
    status?: string | null;
  };
};

export type NasabahAdmin = NasabahBase & {
  totalTransaksi: number;
  totalNilaiTransaksi: number;
};

export type NasabahBsu = NasabahBase & {
  bsu?: {
    idBsu: number;
    nama: string;
    status: string | null;
  };
};

export async function getNasabahAdmin(
  token?: string,
): Promise<ApiResponse<NasabahAdmin[]>> {
  return apiRequest<NasabahAdmin[]>('/api/master/getNasabah', {
    method: 'GET',
    token,
  });
}

export async function getNasabahByBsu(
  token: string,
  idBsu: number,
): Promise<ApiResponse<NasabahBsu[]>> {
  return apiRequest<NasabahBsu[]>('/api/bsu/nasabah/getNasabah', {
    method: 'POST',
    token,
    body: {idBsu},
  });
}

export async function getNasabahDetail(
  token: string,
  idNasabah: number,
): Promise<ApiResponse<NasabahDetail>> {
  return apiRequest<NasabahDetail>(`/api/bsu/nasabah/${idNasabah}`, {
    method: 'GET',
    token,
  });
}

export type UpsertNasabahRequest = {
  fromBsu: 1;
  idNasabah?: number;
  nomorNasabah?: string | null;
  nama: string;
  email?: string | null;
  jenisKelamin: 'Male' | 'Female' | string;
  Nik: string;
  noTelp: string;
  alamat?: string | null;
  tempatLahir: string;
  tglLahir: string;
  kelurahan?: string | null;
  kecamatan?: string | null;
  foto: null;
  saldo: null;
  password?: string;
  roleId: 6;
  bsuId: number;
};

export async function upsertNasabah(
  payload: UpsertNasabahRequest,
  token?: string,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/signup/nasabah', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function deleteNasabah(
  token: string,
  idNasabah: number,
): Promise<ApiResponse<never>> {
  return apiRequest<never>(`/api/bsu/nasabah/${idNasabah}`, {
    method: 'DELETE',
    token,
  });
}
