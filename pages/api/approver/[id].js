import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { responseData, responseMessage } from "@/lib/api/responHandler";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";

export default async function handler(req, res) {
  const { id } = req.query;
  const auth = verifyToken(req, res);
  if (auth.status == 401) {
    return responseMessage(auth.status, auth.message, res);
  }
  if (req.method === "GET") {
    try {
      const model = await prisma.approver.findFirst({
        where: {
          idApprover: parseInt(id),
          deletedAt: null,
        },
        include: {
          bsu: {
            include: {
              nasabah: true,
              jadwal: true,
              pengurus: true,
              hasilverifikasi: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (model?.bsu?.hasilverifikasi?.fasilitas) {
        try {
          model.bsu.hasilverifikasi.fasilitas = JSON.parse(
            model.bsu.hasilverifikasi.fasilitas
          );
        } catch {
          // leave as-is if parsing fails
        }
      }
      model.akun = model.bsu;
      delete model.bsu;

      return responseData(200, model, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else if (req.method === "DELETE") {
    try {
      const model = await prisma.approver.findFirst({
        where: {
          idApprover: parseInt(id),
          deletedAt: null,
        },
      });
      if (model) {
        let idPengurus = await prisma.pengurus.findMany({
          where: {
            bsuId: model.userId,
            deletedAt: null,
          },
        });
        idPengurus = idPengurus.map(({ idPengurus }) => idPengurus);
        await prisma.pengurus.deleteMany({
          where: {
            bsuId: model.userId,
            deletedAt: null,
          },
        });

        await prisma.akun.deleteMany({
          where: {
            idAkun: { in: idPengurus },
            deletedAt: null,
          },
        });

        await prisma.hasilverifikasi.deleteMany({
          where: {
            bsuId: model.userId,
            deletedAt: null,
          },
        });

        await prisma.approver.deleteMany({
          where: {
            userId: model.userId,
            deletedAt: null,
          },
        });

        await prisma.bsu.deleteMany({
          where: {
            idBsu: model.userId,
            deletedAt: null,
          },
        });
        await prisma.akun.deleteMany({
          where: {
            idAkun: model.userId,
            deletedAt: null,
          },
        });
      }
      return responseMessage(200, "Data Berhasil Dihapus", res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
