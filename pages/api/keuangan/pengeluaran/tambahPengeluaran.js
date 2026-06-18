import {
  responseData,
  responseError,
  responseMessage,
} from "@/lib/api/responHandler";
import { nullObjectRemover } from "@/lib/api/nullObjectRemover";
import prisma from "@/lib/api/prisma";
import { verifyToken } from "@/lib/api/checkAuthentication";
import { z } from "zod";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const auth = verifyToken(req, res);
      if (auth.status === 401) {
        return responseMessage(auth.status, auth.message, res);
      }

      const toDateTime = (input) => {
        if (input === null || input === undefined || input === "") {
          return null;
        }
        const d = new Date(input);
        return Number.isNaN(d.getTime()) ? null : d;
      };

      const userSchema = z.object({
        bsuId: z.number(),
        tanggal: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
          }),
        tujuan: z.string().min(3),
        saldo: z.string().refine((val) => !isNaN(parseFloat(val)), {
          message: "Saldo must be a valid number",
        }),
        bukti: z.string().min(3),
      });

      const validate = userSchema.safeParse(req.body);
      if (!validate.success) {
        const error = validate.error.issues;
        return responseError(error, res);
      }

      let body = req.body;
      const { saldo, bukti } = req.body;
      body.saldo = parseFloat(saldo);
      body.bukti = bukti;
      body = nullObjectRemover(body);

      if (!body.tanggal) {
        return responseError(
          [{ message: "tanggalPengeluaran is required" }],
          res
        );
      }

      const tanggalDate = toDateTime(body.tanggal);
      if (!tanggalDate) {
        return responseError([{ message: "tanggal tidak valid" }], res);
      }
      body.tanggal = tanggalDate;

      const previousTotal = await prisma.pengeluaran.aggregate({
        _sum: {
          saldo: true,
        },
      });

      const currentSaldo = body.saldo;
      const newTotalPengeluaran = (previousTotal._sum.saldo || 0) + currentSaldo;

      const pengeluaran = await prisma.pengeluaran.create({
        data: {
          ...body,
          totalPengeluaran: newTotalPengeluaran,
        },
      });

      return responseMessage(
        200,
        "Pengeluaran Berhasil Disimpan.",
        res,
        pengeluaran
      );
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
  } else {
    return responseMessage(405, "Method Not Allowed", res);
  }
}
