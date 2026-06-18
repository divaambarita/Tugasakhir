import {nullObjectRemover} from '@/lib/api/nullObjectRemover'
import prisma from '@/lib/api/prisma'
import {verifyToken} from '@/lib/api/checkAuthentication'
import {
  responseData,
  responseError,
  responseMessage,
} from '@/lib/api/responHandler'
import {z} from 'zod'

export default async function handler(req, res) {
  const auth = verifyToken(req, res)
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res)
  }

  if (req.method !== 'POST') {
    return responseMessage(405, 'Method Not Allowed', res)
  }

  try {
    const schema = z.object({
      idPengurus: z.number().int().positive().optional(),
      bsuId: z.number().int().positive(),
      namaPengurus: z.string().min(3),
      email: z.string().email().nullable().optional(),
      jenisKelamin: z.string().min(3).nullable().optional(),
      noTelp: z.string().min(9),
      alamat: z.string().nullable().optional(),
      tempatLahir: z.string().min(3),
      tglLahir: z.string().min(8),
      pekerjaan: z.string().nullable().optional(),
      jabatan: z.string().min(1),
      ktp: z.string().nullable().optional(),
      roleId: z.number().optional(),
    })

    const validate = schema.safeParse(req.body)
    if (!validate.success) {
      return responseError(validate.error.issues, res)
    }

    const payload = validate.data
    const parsedTglLahir = new Date(payload.tglLahir)
    if (Number.isNaN(parsedTglLahir.getTime())) {
      return responseMessage(503, 'Tanggal lahir tidak valid', res)
    }

    const existing = await prisma.akun.findFirst({
      where: {
        noTelp: payload.noTelp,
        deletedAt: null,
        ...(payload.idPengurus
          ? {
              NOT: {
                idAkun: payload.idPengurus,
              },
            }
          : {}),
      },
      select: {
        idAkun: true,
      },
    })

    if (existing) {
      return responseMessage(503, 'Nomor Telepon Sudah Terdaftar', res)
    }

    if (payload.idPengurus) {
      const pengurus = await prisma.pengurus.findFirst({
        where: {
          deletedAt: null,
          idPengurus: payload.idPengurus,
        },
        select: {
          idPengurus: true,
        },
      })

      if (!pengurus) {
        return responseMessage(404, 'Pengurus tidak ditemukan', res)
      }

      await prisma.akun.update({
        where: {
          idAkun: payload.idPengurus,
        },
        data: {
          nama: payload.namaPengurus,
          email: payload.email ?? null,
          noTelp: payload.noTelp,
          roleId: 5,
        },
      })

      const updateData = nullObjectRemover({
        namaPengurus: payload.namaPengurus,
        email: payload.email ?? null,
        noTelp: payload.noTelp,
        jenisKelamin: payload.jenisKelamin ?? null,
        alamat: payload.alamat ?? null,
        tempatLahir: payload.tempatLahir,
        tglLahir: parsedTglLahir,
        pekerjaan: payload.pekerjaan ?? null,
        jabatan: payload.jabatan,
        ktp: payload.ktp ?? null,
        bsuId: payload.bsuId,
      })

      const updated = await prisma.pengurus.update({
        where: {
          idPengurus: payload.idPengurus,
        },
        data: updateData,
      })

      return responseData(200, updated, res)
    }

    const akun = await prisma.akun.create({
      data: {
        nama: payload.namaPengurus,
        email: payload.email ?? null,
        noTelp: payload.noTelp,
        roleId: 5,
      },
      select: {
        idAkun: true,
      },
    })

    const createData = nullObjectRemover({
      idPengurus: akun.idAkun,
      namaPengurus: payload.namaPengurus,
      email: payload.email ?? null,
      noTelp: payload.noTelp,
      jenisKelamin: payload.jenisKelamin ?? null,
      alamat: payload.alamat ?? null,
      tempatLahir: payload.tempatLahir,
      tglLahir: parsedTglLahir,
      pekerjaan: payload.pekerjaan ?? null,
      jabatan: payload.jabatan,
      ktp: payload.ktp ?? null,
      bsuId: payload.bsuId,
    })

    const created = await prisma.pengurus.create({
      data: createData,
    })

    return responseData(200, created, res)
  } catch (error) {
    return responseMessage(500, error.message, res)
  }
}
