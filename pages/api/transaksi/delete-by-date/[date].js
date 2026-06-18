import prisma from '@/lib/api/prisma'
import { verifyToken } from '@/lib/api/checkAuthentication'
import {
    responseData,
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
            const { date } = req.query;
            const userId = auth.idAkun; // Get user ID from token
            
            if (!date) {
                return responseMessage(400, 'Tanggal harus diisi', res);
            }

            // Get the date range for the given date (start of day to end of day)
            const targetDate = new Date(date);
            const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

            // First, get all nasabah IDs that belong to this BSU
            const bsuNasabah = await prisma.nasabah.findMany({
                where: {
                    bsuId: userId,
                },
                select: {
                    idNasabah: true,
                },
            });

            const nasabahIds = bsuNasabah.map((n) => n.idNasabah);

            if (nasabahIds.length === 0) {
                return responseMessage(404, 'Tidak ada nasabah ditemukan untuk BSU ini', res);
            }

            // Get transactions for this BSU and date
            const transactions = await prisma.transaksi.findMany({
                where: {
                    nasabahId: {
                        in: nasabahIds,
                    },
                    tanggal: {
                        gte: startDate,
                        lt: endDate
                    }
                },
                select: {
                    idTransaksi: true,
                }
            });

            const transactionIds = transactions.map(t => t.idTransaksi);

            if (transactionIds.length === 0) {
                return responseMessage(404, 'Tidak ada transaksi ditemukan untuk tanggal ini', res);
            }

            // First delete all transaction details for these specific transactions
            await prisma.transaksidetail.deleteMany({
                where: {
                    transaksiId: {
                        in: transactionIds,
                    }
                }
            });

            // Then delete the transactions
            await prisma.transaksi.deleteMany({
                where: {
                    idTransaksi: {
                        in: transactionIds,
                    }
                }
            });

            return responseMessage(200, 'Transaksi berhasil dihapus', res);
        } catch (error) {
            console.error('Error deleting transactions:', error);
            return responseMessage(500, error.message, res);
        }
    }

    return responseMessage(405, 'Method not allowed', res);
}
