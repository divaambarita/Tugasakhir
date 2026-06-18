import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type StaffRoleName = 'volunteer' | 'pejabat_eswka' | 'dlh';

export type RegisterStaffRequest = {
  roleName: StaffRoleName;
  nama: string;
  noTelp: string;
  password: string;
  email?: string | null;
  jabatan?: string | null;
};

export type RegisterStaffResponse = {
  idAkun: number;
  roleName: StaffRoleName;
};

export async function registerStaffAccount(
  token: string,
  payload: RegisterStaffRequest,
): Promise<ApiResponse<RegisterStaffResponse>> {
  return apiRequest<RegisterStaffResponse>('/api/admin/registerStaff', {
    method: 'POST',
    token,
    body: payload,
  });
}
