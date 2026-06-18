import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";
import { z } from "zod";
import Bsu from "@/pages/signup/bsu";
Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

export default async function handler(req, res) {
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }
  const { id } = req.query;
  if (req.method === "GET") {
    try {
      const model =
        await prisma.$queryRaw`select b.*, a.password, a.roleId, a.foto FROM simbaci.akun as a INNER JOIN simbaci.bsu as b on a.idAkun = b.idBsu where b.idBsu = ${id}`;
      let data = null;
      if (model.length > 0) {
        data = model[0];
        const jadwal = await prisma.jadwal.findFirst({
          where: {
            bsuId: parseInt(id),
          },
        });
        if (jadwal) {
          jadwal.hari = JSON.parse(jadwal?.hari);
          jadwal.jamMulai =
            (new Date(jadwal?.jamMulai).getHours() > 10
              ? new Date(jadwal?.jamMulai).getHours()
              : "0" + new Date(jadwal?.jamMulai).getHours()) +
            ":" +
            new Date(jadwal?.jamMulai).getMinutes();
          jadwal.jamSelesai =
            (new Date(jadwal?.jamSelesai).getHours() > 10
              ? new Date(jadwal?.jamSelesai).getHours()
              : "0" + new Date(jadwal?.jamSelesai).getHours()) +
            ":" +
            new Date(jadwal?.jamSelesai).getMinutes();
        }
        data.jadwal = jadwal;
        const approver = await prisma.approver.findFirst({
          where: {
            userId: parseInt(id),
            status: model[0].status,
          },
        });
        data.keteranganApprover = approver?.keterangan;

        const pengurus = await prisma.pengurus.findMany({
          where: {
            bsuId: parseInt(id),
          },
        });
        data.pengurus = pengurus;

        const nasabah = await prisma.nasabah.findMany({
          where: {
            bsuId: parseInt(id),
          },
        });
        data.nasabah = nasabah;
      }
      return responseData(200, data, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else if (req.method === "DELETE") {
    try {
      const model = await prisma.bsu.findFirst({
        where: {
          idBsu: parseInt(id),
        },
      });
      if (!model) {
        return responseMessage(
          503,
          "Gagal menghapus data. Akun tidak ditemukan",
          res
        );
      }

      let idPengurus = await prisma.pengurus.findMany({
        where: {
          bsuId: parseInt(id),
        },
      });
      idPengurus = idPengurus.map(({ idPengurus }) => idPengurus);
      await prisma.pengurus.deleteMany({
        where: {
          idPengurus: { in: idPengurus },
        },
      });

      let idNasabah = await prisma.nasabah.findMany({
        where: {
          bsuId: parseInt(id),
        },
      });
      idNasabah = idNasabah.map(({ idNasabah }) => idNasabah);
      await prisma.nasabah.deleteMany({
        where: {
          idNasabah: { in: idNasabah },
        },
      });

      let idHasilVerifikasi = await prisma.hasilverifikasi.findMany({
        where: {
          bsuId: parseInt(id),
        },
      });
      idHasilVerifikasi = idHasilVerifikasi.map(
        ({ idHasilVerifikasi }) => idHasilVerifikasi
      );
      await prisma.hasilverifikasi.deleteMany({
        where: {
          idHasilVerifikasi: { in: idHasilVerifikasi },
        },
      });

      let idApprover = await prisma.approver.findMany({
        where: {
          userId: parseInt(id),
        },
      });
      idApprover = idApprover.map(({ idApprover }) => idApprover);
      await prisma.approver.deleteMany({
        where: {
          idApprover: { in: idApprover },
        },
      });

      let idJadwal = await prisma.jadwal.findMany({
        where: {
          bsuId: parseInt(id),
        },
      });
      idJadwal = idJadwal.map(({ idJadwal }) => idJadwal);
      await prisma.jadwal.deleteMany({
        where: {
          idJadwal: { in: idJadwal },
        },
      });

      let idHargaSampahBsu = await prisma.hargasampahbsu.findMany({
        where: {
          bsuId: parseInt(id),
        },
      });
      idHargaSampahBsu = idHargaSampahBsu.map(
        ({ idHargaSampahBsu }) => idHargaSampahBsu
      );
      await prisma.hargasampahbsu.deleteMany({
        where: {
          idHargaSampahBsu: { in: idHargaSampahBsu },
        },
      });

      await prisma.bsu.delete({
        where: {
          idBsu: parseInt(id),
        },
      });

      await prisma.akun.delete({
        where: {
          deletedAt: null,
          idAkun: parseInt(id),
        },
      });
      return responseMessage(200, "Data berhasil dihapus", res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
