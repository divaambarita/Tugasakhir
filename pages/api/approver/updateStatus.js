import { checkUrlPhoto } from "@/lib/api/checkPhotoProfile";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { z } from "zod";
import { getDateTimeNow } from "@/lib/api/getDateTimeNow";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const auth = verifyToken(req, res);
    if (auth.status == 401) {
      return responseMessage(auth.status, auth.message, res);
    }
    const userSchema = z.object({
      idApprover: z.number(),
      createdBy: z.number(),
      status: z.string(),
    });
    const validate = userSchema.safeParse(req.body);

    if (!validate.success) {
      const error = validate.error.issues;
      return responseError(error, res);
    }
    try {
      const body = req.body;
      if (body.status == "Rejected" && body.keterangan == null) {
        return responseMessage(422, "Keterangan Wajib Diisi", res);
      }
      const { dokumen } = req.body;
      const issetData = await prisma.approver.findFirst({
        where: {
          idApprover: body.idApprover,
          deletedAt: null,
        },
      });
      if (
        issetData &&
        issetData.roleName == "dlh" &&
        body.status == "Approved" &&
        !dokumen
      ) {
        return responseMessage(422, "Mohon melampirkan SK Pendirian BSU", res);
      }
      const model = await prisma.approver.update({
        where: {
          idApprover: body.idApprover,
          deletedAt: null,
        },
        data: {
          status: body.status,
          updatedBy: body.createdBy,
          keterangan: body.keterangan ?? null,
        },
      });
      const data = await prisma.approver.findFirst({
        where: {
          idApprover: body.idApprover,
          deletedAt: null,
        },
        include: {
          bsu: true,
        },
      });

      if (body.status == "Approved" && data.bsu.deletedAt == null) {
        let status = true;
        if (data.typePengajuan == "bsu") {
          const checkApprover = await prisma.approver.findMany({
            where: {
              userId: data.userId,
              deletedAt: null,
              status: "WaitApv",
            },
          });
          if (checkApprover.length != 0) {
            status = false;
          }
          if (status == true && data.roleName == "dlh") {
            await prisma.bsu.update({
              where: {
                idBsu: data.userId,
                deletedAt: null,
              },
              data: {
                skPendirian: dokumen,
              },
            });
          }
        }

        if (status == true) {
          await prisma.bsu.update({
            where: {
              idBsu: data.userId,
              deletedAt: null,
            },
            data: {
              status: "Approved",
              isActive: 1,
            },
          });
        }
      } else if (data.bsu.deletedAt == null) {
        await prisma.bsu.update({
          where: {
            idBsu: data.userId,
            deletedAt: null,
          },
          data: {
            status: "Rejected",
            isActive: 1,
          },
        });
        let idPengurus = await prisma.pengurus.findMany({
          where: {
            bsuId: data.userId,
          },
        });
        // idPengurus = idPengurus.map(({ idPengurus }) => idPengurus);
        // await prisma.pengurus.deleteMany({
        //   where: {
        //     bsuId: data.userId,
        //   },
        // });
        // await prisma.akun.deleteMany({
        //   where: {
        //     idAkun: { in: idPengurus },
        //   },
        // });
      }
      return responseMessage(200, "Data Berhasil Diupdate", res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
