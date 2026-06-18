import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type KategoriSampah = {
  idKategoriSampah: number;
  nama?: string | null;
  emisiKarbon?: number | null;
};

export async function getKategoriSampah(
  token?: string,
): Promise<ApiResponse<KategoriSampah[]>> {
  return apiRequest<KategoriSampah[]>('/api/master/getKategoriSampah', {
    method: 'GET',
    token,
  });
}
