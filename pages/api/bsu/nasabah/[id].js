import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseError, responseMessage } from "@/lib/api/responHandler";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";

export default async function handler(req, res) {
    const auth = verifyToken(req, res);
    if (auth.status == 401) {
      return responseMessage(auth.status, auth.message, res);
    }
    const { id } = req.query;

    if (req.method === "GET") {
      try {
        const model = await prisma.nasabah.findFirst({
          where: {
            deletedAt: null,
            idNasabah: parseInt(id),
          },
          include:{
              bsu:true
          }
        });
        return responseData(200, model, res);
      } catch (error) {
        return responseMessage(500, error.message, res);
      }
    } else if (req.method === 'PUT') {
      try {
        const model = await prisma.nasabah.findFirst({
          where: {
            deletedAt: null,
            idNasabah: parseInt(id),
          },
        });

        if (!model) {
          return responseMessage(404, "Nasabah tidak ditemukan", res);
        }

        const {
          nomorNasabah,
          nama,
          email,
          jenisKelamin,
          Nik,
          noTelp,
          alamat,
          tempatLahir,
          tglLahir,
          kelurahan,
          kecamatan
        } = req.body;

        const updatedNasabah = await prisma.nasabah.update({
          where: {
            idNasabah: parseInt(id),
          },
          data: {
            nomorNasabah: nomorNasabah ?? model.nomorNasabah,
            nama: nama ?? model.nama,
            email: email ?? model.email,
            jenisKelamin: jenisKelamin ?? model.jenisKelamin,
            Nik: Nik ?? model.Nik,
            noTelp: noTelp ?? model.noTelp,
            alamat: alamat ?? model.alamat,
            tempatLahir: tempatLahir ?? model.tempatLahir,
            tglLahir: tglLahir ?? model.tglLahir,
            kelurahan: kelurahan ?? model.kelurahan,
            kecamatan: kecamatan ?? model.kecamatan,
          }
        });

        return responseData(200, updatedNasabah, res);
      } catch (error) {
        return responseMessage(500, error.message, res);
      }
    } else if(req.method === 'DELETE'){
      const model = await prisma.nasabah.findFirst({
        where: {
          deletedAt: null,
          idNasabah: parseInt(id),
        },
      });
      if (!model) {
        return responseMessage(503, "Gagal menghapus data. Akun tidak ditemukan", res);
      }

      await prisma.nasabah.deleteMany({
        where: {
          deletedAt: null,
          idNasabah: parseInt(id),
        },
      })
      await prisma.akun.delete({
        where: {
          deletedAt: null,
          idAkun: parseInt(id),
        },
      })
      return responseMessage(200, "Data berhasil dihapus", res);
    } else {
      return responseMessage(401, "Not Found", res);
    }
}
