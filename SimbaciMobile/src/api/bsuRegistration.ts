import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type JenisKelamin = 'Male' | 'Female';

export type PengurusPayload = {
  idPengurus?: number;
  namaPengurus: string;
  email: string;
  jenisKelamin: JenisKelamin;
  noTelp: string;
  alamat: string;
  pekerjaan: string;
  tempatLahir: string;
  tglLahir: string; // ISO date string (YYYY-MM-DD)
  ktp: string; // URL (hasil upload)
  jabatan: string;
};

export type SignupBsuPayload = {
  fromAdmin: 1;
  idBsu?: number;
  nama: string;
  email: string;
  noTelp: string;
  alamat: string;
  kecamatan: string;
  kelurahan: string;
  password: string;
  foto: null;
  roleId: 4;
  saldo: null;
  pengurus: PengurusPayload[];
};

export async function signupBsuAsAdmin(
  token: string,
  payload: Omit<SignupBsuPayload, 'fromAdmin' | 'roleId' | 'foto' | 'saldo'>,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/signup/bsu', {
    method: 'POST',
    token,
    body: {
      ...payload,
      fromAdmin: 1,
      roleId: 4,
      foto: null,
      saldo: null,
    } satisfies SignupBsuPayload,
  });
}
