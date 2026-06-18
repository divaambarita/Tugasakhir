import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import { z } from "zod";
import argon from "argon2";

const bodySchema = z.object({
  roleName: z.enum(["volunteer", "pejabat_eswka", "dlh"]),
  nama: z.string().min(3),
  email: z.string().email().nullable().optional(),
  jabatan: z.string().min(2).nullable().optional(),
  noTelp: z.string().min(9),
  password: z.string().min(6),
});

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }

  if (req.method !== "POST") {
    return responseMessage(401, "Not Found", res);
  }

  const validate = bodySchema.safeParse(req.body);
  if (!validate.success) {
    return responseError(validate.error.issues, res);
  }

  try {
    // Require admin
    const adminAkun = await prisma.akun.findFirst({
      where: { noTelp: auth.noTelp, deletedAt: null },
      include: { role: true },
    });

    if (!adminAkun || adminAkun.role?.nama !== "admin") {
      return responseMessage(403, "Akses ditolak. Hanya Admin.", res);
    }

    const raw = req.body;

    const targetRole = await prisma.role.findFirst({
      where: { nama: raw.roleName, deletedAt: null },
    });

    if (!targetRole) {
      return responseMessage(503, "Role tidak ditemukan.", res);
    }

    const exists = await prisma.akun.findFirst({
      where: { noTelp: raw.noTelp, deletedAt: null },
      select: { idAkun: true },
    });

    if (exists) {
      return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
    }

    const akunData = nullObjectRemover({
      nama: raw.nama,
      email: raw.email ?? null,
      noTelp: raw.noTelp,
      foto: null,
      roleId: targetRole.idRole,
      password: await argon.hash(raw.password),
    });

    const personalData = nullObjectRemover({
      nama: raw.nama,
      email: raw.email ?? null,
      noTelp: raw.noTelp,
      jabatan: raw.jabatan ?? null,
    });

    const created = await prisma.$transaction(async (tx) => {
      const akun = await tx.akun.create({ data: akunData });

      if (raw.roleName === "volunteer") {
        await tx.volunteer.create({
          data: {
            idVolunteer: akun.idAkun,
            ...personalData,
          },
        });
      } else if (raw.roleName === "pejabat_eswka") {
        await tx.pejabateswka.create({
          data: {
            idPejabatEswka: akun.idAkun,
            ...personalData,
          },
        });
      } else if (raw.roleName === "dlh") {
        await tx.dlh.create({
          data: {
            idDlh: akun.idAkun,
            ...personalData,
          },
        });
      }

      return akun;
    });

    return responseData(
      200,
      { idAkun: created.idAkun, roleName: raw.roleName },
      res
    );
  } catch (error) {
    return responseMessage(500, error.message, res);
  }
}
