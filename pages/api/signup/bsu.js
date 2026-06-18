import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/api/checkAuthentication";
import argon from "argon2";

export default async function handler(req, res) {
  if (req.method === "POST") {
    //validasi request
    if (req.body.fromAdmin && req.body.fromAdmin == 1) {
      const auth = verifyToken(req, res);
      if (auth.status == 401) {
        return responseMessage(auth.status, auth.message, res);
      }
    }

    const userSchema = z.object({
      nama: z.string().min(3),
      email: z.string().nullable(),
      noTelp: z.string().min(9),
      alamat: z.string().nullable(),
      kecamatan: z.string().nullable(),
      kelurahan: z.string().nullable(),
      foto: z.string().nullable(),
      password: z.string().min(6),
      roleId: z.number(),
      saldo: z.number().nullable(),
    });

    const validate = userSchema.safeParse(req.body);

    if (!validate.success) {
      const error = validate.error.issues;
      return responseError(error, res);
    }
    const arrayPengurus = req.body.pengurus;
    if (!arrayPengurus || arrayPengurus.length < 4) {
      return responseMessage(503, "Minimal Terdapat 4 Pengurus", res);
    }

    try {
      const checkRole = await prisma.role.findUnique({
        where: {
          idRole: req.body.roleId,
          deletedAt: null,
        },
      });
      const listAdmin = ["bsu"];
      if (checkRole && !listAdmin.includes(checkRole.nama)) {
        return responseMessage(
          503,
          "Tidak dapat melakukan registrasi akun, role yang anda masukan tidak sesuai",
          res
        );
      }
      const { alamat, kelurahan, kecamatan, saldo, idBsu } = req.body;
      //delete object value null
      const body = nullObjectRemover(req.body);

      //hash password dan tambah status pada object body
      body.password = await argon.hash(body.password);
      body.idAkun = idBsu;

      delete body.idBsu;
      delete body.confirmPassword;
      delete body.alamat;
      delete body.kelurahan;
      delete body.kecamatan;
      delete body.saldo;
      delete body.pengurus;
      delete body.fromAdmin;

      //check akun
      if (idBsu) {
        const issetData = await prisma.akun.findUnique({
          where: {
            noTelp: body.noTelp,
            deletedAt: null,
            NOT: {
              idAkun: idBsu,
            },
          },
        });
        if (issetData) {
          return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
        }
      } else {
        const issetData = await prisma.akun.findUnique({
          where: {
            noTelp: body.noTelp,
            deletedAt: null,
          },
        });
        if (issetData) {
          return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
        }
      }

      //insery akun
      if (!idBsu) {
        await prisma.akun.create({
          data: body,
        });
      }

      //jika berhasil data di input ke data admin/pejabat/dlh
      let showData = await prisma.akun.findFirst({
        where: {
          noTelp: body.noTelp,
          deletedAt: null,
        },
        select: {
          nama: true,
          email: true,
          noTelp: true,
          idAkun: true,
        },
      });
      showData.alamat = alamat ?? null;
      showData.kelurahan = kelurahan ?? null;
      showData.kecamatan = kecamatan ?? null;
      showData.saldo = saldo ?? null;
      showData.idBsu = showData.idAkun;
      showData.status = "WaitApv";
      showData.isActive = 0;
      delete showData.idAkun;

      showData = nullObjectRemover(showData);

      if (!idBsu) {
        await prisma.bsu.create({
          data: showData,
        });
      }
      let arrIdPengurus = await prisma.pengurus.findMany({
        where: {
          bsuId: showData.idBsu,
        },
      });

      arrIdPengurus = arrIdPengurus.map(({ idPengurus }) => idPengurus);
      let idPengurus = [];
      for (const model of arrayPengurus) {
        model.bsuId = showData.idBsu;

        //check akun
        let issetData = await prisma.akun.findFirst({
          where: {
            noTelp: model.noTelp,
            deletedAt: null,
          },
        });
        if (idBsu) {
          issetData = await prisma.akun.findFirst({
            where: {
              noTelp: model.noTelp,
              deletedAt: null,
              NOT: {
                idAkun: model.idPengurus,
              },
            },
          });
        }
        if (issetData && !idBsu) {
          await prisma.pengurus.deleteMany({
            where: {
              bsuId: showData.idBsu,
              deletedAt: null,
            },
          });
          for (const delPengurus of idPengurus) {
            await prisma.akun.delete({
              where: {
                idAkun: delPengurus,
              },
            });
          }
          idPengurus = [];
          await prisma.bsu.delete({
            where: {
              noTelp: body.noTelp,
              deletedAt: null,
            },
          });
          await prisma.akun.delete({
            where: {
              noTelp: body.noTelp,
              deletedAt: null,
            },
          });
          return responseMessage(
            503,
            "Nomor Telepon Pengurus Sudah Terdaftar",
            res
          );
        } else if (issetData && idBsu) {
          if (!arrIdPengurus.includes(issetData.idAkun)) {
            return responseMessage(
              503,
              "Nomor Telepon Pengurus Sudah Terdaftar",
              res
            );
          }
        }
        if (!idBsu) {
          const pengurus = await prisma.akun.create({
            data: {
              nama: model.namaPengurus,
              email: model.email ?? null,
              noTelp: model.noTelp,
              roleId: 5,
            },
          });
          model.idPengurus = pengurus.idAkun;
          idPengurus.push(pengurus.idAkun);
          const parsedTglLahir = new Date(model.tglLahir);
          if (Number.isNaN(parsedTglLahir.getTime())) {
            return responseMessage(
              503,
              `Tanggal lahir pengurus (${model.jabatan ?? ""}) tidak valid`,
              res
            );
          }
          model.tglLahir = parsedTglLahir;

          const objectPengurus = nullObjectRemover(model);
          await prisma.pengurus.create({
            data: objectPengurus,
          });
        } else {
          const pengurus = await prisma.akun.update({
            where: { idAkun: model.idPengurus },
            data: {
              nama: model.namaPengurus,
              email: model.email ?? null,
              noTelp: model.noTelp,
              roleId: 5,
            },
          });
          model.idPengurus = pengurus.idAkun;
          idPengurus.push(pengurus.idAkun);
          const parsedTglLahir = new Date(model.tglLahir);
          if (Number.isNaN(parsedTglLahir.getTime())) {
            return responseMessage(
              503,
              `Tanggal lahir pengurus (${model.jabatan ?? ""}) tidak valid`,
              res
            );
          }
          model.tglLahir = parsedTglLahir;

          const objectPengurus = nullObjectRemover(model);
          await prisma.pengurus.update({
            where: { idPengurus: model.idPengurus },
            data: objectPengurus,
          });
        }
      }

      if (idBsu) {
        await prisma.akun.update({
          where: {
            idAkun: idBsu,
          },
          data: body,
        });
        await prisma.bsu.update({
          where: {
            idBsu: idBsu,
          },
          data: showData,
        });
      }

      await prisma.approver.deleteMany({
        where: {
          userId: showData.idBsu,
        },
      });

      await prisma.approver.createMany({
        data: [
          {
            userId: showData.idBsu,
            typePengajuan: "bsu",
            roleId: 1,
            roleName: "Admin",
            status: "WaitApv",
          },
          {
            userId: showData.idBsu,
            typePengajuan: "bsu",
            roleId: 2,
            roleName: "pejabat_eswka",
            status: "WaitApv",
          },
          {
            userId: showData.idBsu,
            typePengajuan: "bsu",
            roleId: 3,
            roleName: "dlh",
            status: "WaitApv",
          },
        ],
      });

      return responseMessage(
        200,
        "Registrasi Berhasil, Mohon Mengunggu Verifikasi Admin",
        res
      );
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
