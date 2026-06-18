import type {ApiResponse} from './types';
import {apiRequest} from './client';

export type BsuSampahMonitoring = {
  totalNasabah: number;
  totalHargaKeseluruhan: number;
  beratPerKategoriByMonthYear: Record<
    string,
    {
      totalKeseluruhan: number;
      [kategori: string]: number;
    }
  >;
  emisiKarbonPerKategoriByMonthYear: Record<
    string,
    {
      totalKeseluruhan: number;
      [kategori: string]: number;
    }
  >;
};

export type BsiSampahMonitoring = BsuSampahMonitoring & {
  totalBSU: number;
};

export type BsuNasabahSaldoRow = {
  idNasabah: number;
  nama: string;
  alamat: string;
  saldo: number;
};

export type LeaderboardNasabahRow = {
  nomorNasabah: string | null;
  nama: string | null;
  totalTabungan: number;
  totalSampah: number;
};

export type NasabahSampahMonitoring = {
  beratPerKategoriByMonthYear: BsuSampahMonitoring['beratPerKategoriByMonthYear'];
  emisiKarbonPerKategoriByMonthYear: BsuSampahMonitoring['emisiKarbonPerKategoriByMonthYear'];
};

export function getBsuSampahMonitoring(
  token: string,
  bsuId: number,
): Promise<ApiResponse<BsuSampahMonitoring>> {
  return apiRequest<BsuSampahMonitoring>(
    `/api/monitoring/sampah/bsu/${bsuId}`,
    {
      token,
    },
  );
}

export function getBsiSampahMonitoring(
  token: string,
): Promise<ApiResponse<BsiSampahMonitoring>> {
  return apiRequest<BsiSampahMonitoring>(
    '/api/monitoring/sampah/bsi/getMonitoringBsi',
    {
      token,
    },
  );
}

export function getBsuNasabahSaldoMonitoring(
  token: string,
  bsuId: number,
): Promise<ApiResponse<BsuNasabahSaldoRow[]>> {
  return apiRequest<BsuNasabahSaldoRow[]>(
    `/api/monitoring/saldo/bsu/${bsuId}`,
    {
      token,
    },
  );
}

export function getNasabahLeaderboard(
  token: string | undefined,
  bsuId?: number,
): Promise<ApiResponse<LeaderboardNasabahRow[]>> {
  const qs = bsuId ? `?idBsu=${encodeURIComponent(String(bsuId))}` : '';
  return apiRequest<LeaderboardNasabahRow[]>(
    `/api/monitoring/leaderboard/nasabah${qs}`,
    {
      token,
    },
  );
}

export function getNasabahSampahMonitoring(
  token: string | undefined,
  nasabahId: number,
): Promise<ApiResponse<NasabahSampahMonitoring>> {
  return apiRequest<NasabahSampahMonitoring>(
    `/api/monitoring/sampah/nasabah/${nasabahId}`,
    {
      token,
    },
  );
}
