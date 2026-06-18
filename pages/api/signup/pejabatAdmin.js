import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";
import { z } from "zod";
import argon from "argon2"

export default async function handler(req, res) {
  if (req.method === "POST") {
    //validasi request
    const userSchema = z.object({
      nama: z.string().min(3),
      email: z.string().nullable(),
      jabatan: z.string().nullable(),
      foto: z.string().nullable(),
      noTelp: z.string().min(9),
      password: z.string().min(6),
      roleId: z.number()
    })
    const validate = userSchema.safeParse(req.body); //untuk ngecek valiasinya udh bener atau blm

    if (!validate.success) { //kalau blm sesuai
      const error = validate.error.issues;
      return responseError(error, res);
    }

    try {
      const checkRole = await prisma.role.findUnique({
        where:{
          idRole:req.body.roleId,
          deletedAt:null
        }
      })
      const listAdmin = ['admin', 'pejabat_eswka', 'dlh', 'volunteer']
      if(checkRole && !listAdmin.includes(checkRole.nama)){
        return responseMessage(503,"Tidak dapat melakuka registrasi akun", res);
      }

      //delete object value null
      const body = nullObjectRemover(req.body);

      //hash password dan tambah status pada object body
      body.password = await argon.hash(body.password) //di hash karna rahasia
      delete body.confirmPassword
      delete body.jabatan

      //check akun
      const issetData = await prisma.akun.findUnique({
        where: {
          noTelp: body.noTelp,
          deletedAt:null
        },
      });
  
      if (issetData) {
        return responseMessage(503, "Nomor Telepon Sudah Terdaftar", res);
      }
      
      //insery akun
      await prisma.akun.create({
        data: body, 
      });

      //jika berhasil data di input ke data admin/pejabat/dlh
      let showData = await prisma.akun.findFirst({
        where: {
          noTelp: body.noTelp,
          deletedAt:null
        },
        select:{
          nama:true,
          email:true,
          noTelp: true,
          idAkun: true
        }
      });
      showData.jabatan = req.body.jabatan??null
      showData = nullObjectRemover(showData)
      if (checkRole.nama == 'admin') {
        showData.idAdmin = showData.idAkun
        delete showData.idAkun
        await prisma.admin.create({
          data: showData
        })
      } else if (checkRole.nama =='pejabat_eswka') {
        showData.idPejabatEswka = showData.idAkun
        delete showData.idAkun

        await prisma.pejabateswka.create({
          data: showData
        })
      } else if (checkRole.nama =='dlh') {
        showData.idDlh = showData.idAkun
        delete showData.idAkun
        await prisma.dlh.create({
          data: showData
        })
      } else if (checkRole.nama =='volunteer') {
        showData.idVolunteer = showData.idAkun
        delete showData.idAkun
        await prisma.volunteer.create({
          data: showData
        })
      }

      return responseMessage(200, "Registrasi Berhasil", res);
    } catch (error) {
      return responseMessage(500, error.message, res); //kalau eror di kodingan, 503 di validasi
    }
  } else {
    return responseMessage(401, "Not Found", res); 
  }
}
