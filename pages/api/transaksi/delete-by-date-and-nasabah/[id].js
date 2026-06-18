import prisma from '@/lib/api/prisma'
import { verifyToken } from '@/lib/api/checkAuthentication'
import {
  responseData,
  responseError,
  responseMessage,
} from '@/lib/api/responHandler'

export default async function handler(req, res) {
    const { method } = req
    const auth = verifyToken(req, res)
    if (auth.status == 401) {
        return responseMessage(auth.status, auth.message, res)
    }

    if(method === 'DELETE') {
        try {
            const { tanggal } = req.body;
            const { id: namaNasabah } = req.query; // Nama nasabah dari URL parameter
            const userId = auth.idAkun; // Get user ID from token
            
            if (!namaNasabah) {
                return responseMessage(400, 'Nama nasabah harus diisi', res);
            }

            // Get the specific date at the start (00:00:00) and end (23:59:59)
            const targetDate = new Date(tanggal)
            targetDate.setHours(0, 0, 0, 0)
            
            const nextDate = new Date(targetDate)
            nextDate.setDate(nextDate.getDate() + 1)

            // First, verify that the nasabah belongs to this BSU
            const nasabah = await prisma.nasabah.findFirst({
                where: {
                    nama: decodeURIComponent(namaNasabah),
                    bsuId: userId // Only allow if nasabah belongs to this BSU
                }
            });

            if (!nasabah) {
                return responseMessage(404, 'Nasabah tidak ditemukan atau tidak memiliki akses', res);
            }

            // Find all transactions on the specific date for the specific nasabah
            const transactions = await prisma.transaksi.findMany({
                where: {
                    tanggal: {
                        gte: targetDate,
                        lt: nextDate
                    },
                    nasabahId: nasabah.idNasabah // Use nasabah ID instead of name search
                },
                include: {
                    transaksidetail: true,
                    nasabah: true
                }
            });

            if (transactions.length === 0) {
                return responseMessage(404, 'Tidak ada transaksi yang ditemukan', res)
            }

            // Delete all transaction details first
            for (const transaction of transactions) {
                await prisma.transaksidetail.deleteMany({
                    where: {
                        transaksiId: transaction.idTransaksi
                    }
                });
            }

            // Then delete all transactions for this nasabah on this date
            await prisma.transaksi.deleteMany({
                where: {
                    tanggal: {
                        gte: targetDate,
                        lt: nextDate
                    },
                    nasabahId: nasabah.idNasabah // Use nasabah ID instead of name search
                }
            });

            return responseMessage(200, 'Transaksi berhasil dihapus', res)
        } catch (error) {
            console.error('Error deleting transactions:', error)
            return responseMessage(500, error.message, res)
        }
    }

    return responseMessage(405, 'Method not allowed', res)
}
