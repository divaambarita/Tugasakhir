import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type MitraSignupRequest = {
  namaPerusahaan: string;
  alamatPerusahaan: string | null;
  email: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  jenisMitra: string;
  jenisInstansi: string;
  foto: string | null;
  noTelp: string;
  password: string;
  roleId: number;
};

export async function signupMitra(
  payload: MitraSignupRequest,
): Promise<ApiResponse<unknown>> {
  return apiRequest<unknown>('/api/signup/mitra', {
    method: 'POST',
    body: payload,
  });
}
