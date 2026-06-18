import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type VolunteerBsuRow = {
  idBsu: number;
  nama: string;
  noTelp: string;
  alamat?: string | null;
  kecamatan?: string | null;
  kelurahan?: string | null;
  status?: string | null;
  hasilverifikasi?: {
    lokasi: string;
    luasTempat: string;
    kondisiBangunan: string;
    fasilitas: unknown;
    fotoKunjungan: string;
  } | null;
};

export async function getBsuForVerification(
  token: string,
  status: string,
): Promise<ApiResponse<VolunteerBsuRow[]>> {
  return apiRequest<VolunteerBsuRow[]>('/api/volunteer/getDataVerifikasi', {
    method: 'POST',
    token,
    body: {status},
  });
}

export type SaveVerificationRequest = {
  volunteerId: number;
  bsuId: number;
  lokasi: string;
  dokumen: string;
  luasTempat: string;
  kondisiBangunan: string;
  fasilitas: Array<Record<string, unknown>>;
};

export async function saveVerification(
  token: string,
  payload: SaveVerificationRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/volunteer/verifikasi', {
    method: 'POST',
    token,
    body: payload,
  });
}

export type VolunteerStats = {
  status: string;
  totalTarget: number;
  totalSudahSurvey: number;
  totalBelumSurvey: number;
  totalSayaSurvey: number;
};

export async function getVolunteerStats(
  token: string,
  status?: string,
): Promise<ApiResponse<VolunteerStats>> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest<VolunteerStats>(`/api/volunteer/stats${qs}`, {
    method: 'GET',
    token,
  });
}

export type VolunteerRiwayatRow = {
  idHasilVerifikasi: number;
  lokasi: string;
  luasTempat: string;
  kondisiBangunan: string;
  fasilitas: unknown;
  fotoKunjungan: string;
  bsuId: number;
  volunteerId: number;
  createdAt: string;
  updatedAt: string;
  bsu?: {
    idBsu: number;
    nama: string;
    alamat?: string | null;
    kecamatan?: string | null;
    kelurahan?: string | null;
    status?: string | null;
    noTelp: string;
  };
};

export async function getVolunteerRiwayat(
  token: string,
): Promise<ApiResponse<VolunteerRiwayatRow[]>> {
  return apiRequest<VolunteerRiwayatRow[]>('/api/volunteer/riwayat', {
    method: 'GET',
    token,
  });
}
