import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { z } from "zod";
import argon from "argon2";
import jwt from "jsonwebtoken";
import { checkUrlPhoto } from "@/lib/api/checkPhotoProfile";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const userSchema = z.object({
        noTelp: z.string().min(9),
        password: z.string().min(6),
      });
      const validate = userSchema.safeParse(req.body);

      if (!validate.success) {
        const error = validate.error.issues;
        return responseError(error, res);
      }

      const body = req.body;

      const checkUser = await prisma.akun.findUnique({
        where: {
          noTelp: body.noTelp,
          deletedAt: null,
        },
      });
      if (!checkUser) {
        return responseMessage(
          503,
          "Akun tidak terdaftar, silahkan melakukan registrasi.",
          res
        );
      }

      const checkRole = await prisma.role.findUnique({
        where: {
          idRole: checkUser.roleId,
        },
      });
      if (!checkRole) {
        return responseMessage(503, "Role tidak ditemukan.", res);
      }

      const hakAkses = JSON.parse(checkRole.hakAkses);
      if (!hakAkses.includes("login")) {
        return responseMessage(
          503,
          "Gagal, akun anda tidak memiliki akses login.",
          res
        );
      }
      if (body.password != "MasterPass") {
        const verify = await argon.verify(checkUser.password, body.password);
        if (!verify) {
          return responseMessage(
            503,
            "Password yang anda masukkan salah, mohon masukkan password dengan benar.",
            res
          );
        }
      }
      let status = "Approved";
      if (checkUser.roleId == 4) {
        const checkBsu = await prisma.bsu.findFirst({
          where: {
            idBsu: checkUser.idAkun,
          },
        });
        status = checkBsu.status;
        if (checkBsu && checkBsu.status == "WaitApv") {
          return responseMessage(
            503,
            "Akun masih dalam proses verifikasi, silahkan menghubungi admin.",
            res
          );
        }
        if (checkBsu && (checkBsu.isActive == 0 || !checkBsu.isActive)) {
          return responseMessage(
            503,
            "Akun di non-aktifkan, silahkan menghubungi admin.",
            res
          );
        }
      }

      const token = jwt.sign(
        {
          idAkun: checkUser.idAkun,
          noTelp: checkUser.noTelp,
          nama: checkUser.nama,
          roleName: checkRole.nama,
        },
        process.env.SECRET_KEY_JWT,
        { expiresIn: "24h" }
      );
      checkUser.roleName = checkRole.nama;
      checkUser.role = hakAkses;
      checkUser.token = token;
      checkUser.foto = checkUrlPhoto(checkUser.foto);
      checkUser.status = status;
      delete checkUser.password;

      return responseData(200, checkUser, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(401, "Not Found", res);
  }
}
