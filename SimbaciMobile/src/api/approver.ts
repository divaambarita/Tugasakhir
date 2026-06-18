import {apiRequest} from './client';
import type {ApiResponse} from './types';

export type ApproverRow = {
  idApprover: number;
  userId: number;
  typePengajuan: string;
  roleId: number;
  roleName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  akun?: {
    idBsu: number;
    nama: string;
    noTelp: string;
    alamat?: string | null;
    kecamatan?: string | null;
    kelurahan?: string | null;
    status?: string | null;
  };
  keterangan?: string | null;
};

export type GetApproverRequest = {
  id: number;
};

export async function getApprovals(
  token: string,
  userId: number,
): Promise<ApiResponse<ApproverRow[]>> {
  return apiRequest<ApproverRow[]>('/api/approver/getApprover', {
    method: 'POST',
    token,
    body: {id: userId} satisfies GetApproverRequest,
  });
}

export type ApprovalDetail = ApproverRow & {
  akun: {
    idBsu: number;
    nama: string;
    noTelp: string;
    alamat?: string | null;
    kecamatan?: string | null;
    kelurahan?: string | null;
    pengurus?: unknown[];
    jadwal?: unknown;
    nasabah?: unknown[];
    hasilverifikasi?: {
      lokasi: string;
      luasTempat: string;
      kondisiBangunan: string;
      fasilitas: unknown;
      fotoKunjungan: string;
    } | null;
  };
};

export async function getApprovalDetail(
  token: string,
  idApprover: number,
): Promise<ApiResponse<ApprovalDetail>> {
  return apiRequest<ApprovalDetail>(`/api/approver/${idApprover}`, {
    method: 'GET',
    token,
  });
}

export type UpdateApprovalStatusRequest = {
  idApprover: number;
  createdBy: number;
  status: 'Approved' | 'Rejected';
  keterangan?: string | null;
  dokumen?: string | null;
};

export async function updateApprovalStatus(
  token: string,
  payload: UpdateApprovalStatusRequest,
): Promise<ApiResponse<never>> {
  return apiRequest<never>('/api/approver/updateStatus', {
    method: 'POST',
    token,
    body: payload,
  });
}
