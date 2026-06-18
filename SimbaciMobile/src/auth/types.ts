export type RoleName =
  | 'admin'
  | 'bsu'
  | 'nasabah'
  | 'approver'
  | 'volunteer'
  | 'mitra'
  | 'pejabat_eswka'
  | 'dlh'
  | string;

export type CurrentUser = {
  idAkun: number;
  noTelp: string;
  nama: string;
  roleId: number;
  roleName: RoleName;
  role: string[];
  token: string;
  status?: string;
  foto?: string | null;
};
