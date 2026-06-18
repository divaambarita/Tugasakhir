import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type PemasukanRow = {
  idPemasukan: number;
  tanggal: string;
  tujuan: string;
  saldo: number;
  keterangan: string;
  totalPemasukan: number;
  createdAt: string;
  bsuId: number;
};

export type PengeluaranRow = {
  idPengeluaran: number;
  tanggal: string;
  tujuan: string;
  saldo: number;
  bukti: string;
  totalPengeluaran: number;
  createdAt: string;
  bsuId: number;
};

export type PenjualanItem = {
  berat: number;
  harga: number;
  totalPenjualan: number;
  jenisSampahId: number;
};

// Note: this is the grouped format returned by `/api/keuangan/pemasukan/getPenjualan`.
export type PenjualanGroupedRow = {
  idPenjualan: number;
  tanggal: string;
  tujuan: string;
  saldo: number;
  bsuId: number;
  createdAt: string;
  items: PenjualanItem[];
};

export type CreatePemasukanLainnyaRequest = {
  bsuId: number;
  tanggal: string;
  tujuan: string;
  saldo: string;
  keterangan: string;
};

export type CreatePengeluaranRequest = {
  bsuId: number;
  tanggal: string;
  tujuan: string;
  saldo: string;
  bukti: string;
};

export type CreatePenjualanItemRequest = {
  berat: number;
  harga: number;
  jenisSampahId: number;
};

export type CreatePenjualanRequest = {
  tanggal: string;
  nama: string;
  bsuId: number;
  penjualanItems: CreatePenjualanItemRequest[];
};

export type CreatePenjualanResponse = {
  message: string;
  data: {
    penjualan: unknown[];
    totalPenjualan: number;
    saldoBaru: number;
  };
};

export async function getPemasukanByBsu(
  token: string,
  bsuId: number,
): Promise<ApiResponse<PemasukanRow[]>> {
  return apiRequest<PemasukanRow[]>(
    `/api/keuangan/pemasukan/getPemasukan?bsuId=${encodeURIComponent(
      String(bsuId),
    )}`,
    {
      method: 'GET',
      token,
    },
  );
}

export async function getPengeluaranByBsu(
  token: string,
  bsuId: number,
): Promise<ApiResponse<PengeluaranRow[]>> {
  return apiRequest<PengeluaranRow[]>(
    `/api/keuangan/pengeluaran/getPengeluaran?bsuId=${encodeURIComponent(
      String(bsuId),
    )}`,
    {
      method: 'GET',
      token,
    },
  );
}

export async function getPenjualanByBsu(
  token: string,
  bsuId: number,
): Promise<ApiResponse<PenjualanGroupedRow[]>> {
  return apiRequest<PenjualanGroupedRow[]>(
    `/api/keuangan/pemasukan/getPenjualan?bsuId=${encodeURIComponent(
      String(bsuId),
    )}`,
    {
      method: 'GET',
      token,
    },
  );
}

export async function createPemasukanLainnya(
  token: string,
  payload: CreatePemasukanLainnyaRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/keuangan/pemasukan/tambahPemasukanLainnya', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function createPengeluaran(
  token: string,
  payload: CreatePengeluaranRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/keuangan/pengeluaran/tambahPengeluaran', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function createPenjualan(
  token: string,
  payload: CreatePenjualanRequest,
): Promise<ApiResponse<CreatePenjualanResponse>> {
  return apiRequest<CreatePenjualanResponse>(
    '/api/keuangan/pemasukan/tambahPenjualan',
    {
      method: 'POST',
      token,
      body: payload,
    },
  );
}

export async function deletePemasukan(
  token: string,
  idPemasukan: number,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/keuangan/delete', {
    method: 'DELETE',
    token,
    body: {idPemasukan},
  });
}

export async function deletePengeluaran(
  token: string,
  idPengeluaran: number,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/keuangan/delete', {
    method: 'DELETE',
    token,
    body: {idPengeluaran},
  });
}
