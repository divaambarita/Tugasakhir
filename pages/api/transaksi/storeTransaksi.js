import prisma from '@/lib/api/prisma'
import { verifyToken } from '@/lib/api/checkAuthentication'
import {
  responseData,
  responseError,
  responseMessage,
} from '@/lib/api/responHandler'

export default async function handler(req, res) {
    const auth = verifyToken(req, res)
    if (auth.status == 401) {
        return responseMessage(auth.status, auth.message, res)
    }
    if(method === 'POST') {
        try {
            const data = req.body
            const result = await prisma.transaksi.create({
                data: {
                    idTransaksi: data.idTransaksi,
                    nasabahId: data.nasabahId,
                    totalHarga: data.totalHarga,
                    transaksiDetail: {
                        berat: data.berat,
                        hargaTotal: data.harga,
                        jenisSampahId: data.jenisSampahId,
                        transaksiId: idTransaksi
                    }
                }
            })
            return responseData(200, result, res)
        }
        catch (error) {
            return responseError(500, error.message, res)
        }
    }
}