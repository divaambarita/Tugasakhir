import prisma from "@/lib/api/prisma";
import { responseData, responseError, responseMessage } from "@/lib/api/responHandler";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { z } from "zod";
import { checkUrlPhoto } from "@/lib/api/checkPhotoProfile";
import next from "next";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const auth = verifyToken(req, res);
    if (auth.status == 401) {
      return responseMessage(auth.status, auth.message, res);
    }
    const userSchema = z.object({
      id: z.number(),
    });
    const validate = userSchema.safeParse(req.body);

    if (!validate.success) {
      const error = validate.error.issues;
      return responseError(error, res);
    }
    try {
      const user = await prisma.akun.findFirst({
        where: {
          deletedAt: null,
          idAkun: req.body.id,
        },
      });
      if (!user) {
        responseMessage(503, "User Tidak Ditemukan", res);
      }
      const role = await prisma.role.findFirst({
        where: { idRole: user.roleId },
      });


      const models = await prisma.approver.findMany({
        where: {
          deletedAt: null,
          roleId: user.roleId,
          status: "WaitApv",
        },
        include: {
          bsu: true,
        },
        orderBy: [
          {
            createdAt: "asc",
          },
        ],
      });
      let data = [];
      for (const model of models) {
        let status = true;
        if (model.typePengajuan == "bsu") {
          const check1 = await prisma.approver.findFirst({
            where: {
              userId: model.userId,
              deletedAt: null,
              roleName: "Admin",
              status: "Approved",
            },
          });
          if (!check1 && role.nama == "pejabat_eswka") {
            status = false;
          }
          if (role.nama == "dlh" && status == true) {
            const check2 = await prisma.approver.findFirst({
              where: {
                userId: model.userId,
                deletedAt: null,
                roleName: "pejabat_eswka",
                status: "Approved",
              },
            });
            if (!check2) {
              status = false;
            }
          }
          const verifikasi = await prisma.hasilverifikasi.findMany({
            where: {
              deletedAt: null,
              bsuId: model.userId,
            },
          });
          if (verifikasi.length == 0) {
            status = false;
          }
        }

        if (status == true) {
          model.akun = model.bsu
          delete model.bsu
          data.push(model);
        }
      }
      return responseData(200, data, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
