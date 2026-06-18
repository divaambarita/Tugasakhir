import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type TransaksiSummary = {
  idTransaksi: number;
  idNasabah?: number;
  nama?: string;
  tanggal: string;
  beratsampah: number;
  totalhargasampah: number;
};

export async function getTransaksiByBsu(
  token: string,
  bsuId: number,
  type: 'today' | 'all' | undefined = 'all',
): Promise<ApiResponse<TransaksiSummary[]>> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiRequest<TransaksiSummary[]>(`/api/transaksi/${bsuId}${qs}`, {
    method: 'GET',
    token,
  });
}

export async function getTransaksiByNasabah(
  token: string,
  nasabahId: number,
  type: 'today' | 'all' | undefined = 'all',
): Promise<ApiResponse<TransaksiSummary[]>> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiRequest<TransaksiSummary[]>(`/api/transaksi/${nasabahId}${qs}`, {
    method: 'GET',
    token,
  });
}

export type CreateTransaksiItem = {
  idJenisSampah: number;
  berat: number;
  harga: number;
};

export type CreateTransaksiRequest = {
  idNasabah: number;
  items: CreateTransaksiItem[];
  bsuId: number;
  buktiFoto?: string;
};

export async function createTransaksi(
  token: string,
  payload: CreateTransaksiRequest,
): Promise<ApiResponse<unknown>> {
  return apiRequest<unknown>('/api/transaksi/store', {
    method: 'POST',
    token,
    body: payload,
  });
}

export type TransaksiDetailRow = {
  transaksiId: number;
  jenisSampahId: number;
  beratsampah: number;
  hargasatuan: number;
  totalhargasampah: number;
  nasabah?: {
    idNasabah?: number;
    nama?: string;
  };
  jenisSampah?: {
    idJenisSampah?: number;
    nama?: string;
  };
};

export async function getTransaksiDetailByDate(
  token: string,
  date: string,
): Promise<ApiResponse<TransaksiDetailRow[]>> {
  return apiRequest<TransaksiDetailRow[]>(`/api/transaksi/detail/get/${date}`, {
    method: 'GET',
    token,
  });
}

export async function deleteTransaksiDetail(
  token: string,
  transaksiId: number,
  jenisSampahId: number,
): Promise<ApiResponse<unknown>> {
  return apiRequest<unknown>(`/api/transaksi/detail/delete/${transaksiId}`, {
    method: 'DELETE',
    token,
    body: {
      transaksiId: String(transaksiId),
      jenisSampahId: String(jenisSampahId),
    },
  });
}

export type UpdateTransaksiDetailRequest = {
  jenisSampahId: number;
  beratsampah: number;
};

export async function updateTransaksiDetail(
  token: string,
  transaksiId: number,
  oldJenisSampahId: number,
  payload: UpdateTransaksiDetailRequest,
): Promise<ApiResponse<unknown>> {
  const qs = `?oldJenisSampahId=${encodeURIComponent(
    String(oldJenisSampahId),
  )}`;
  return apiRequest<unknown>(
    `/api/transaksi/detail/update/${encodeURIComponent(
      String(transaksiId),
    )}${qs}`,
    {
      method: 'PUT',
      token,
      body: payload,
    },
  );
}
