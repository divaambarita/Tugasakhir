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

    const { id } = req.query

    if (!id || isNaN(parseInt(id))) {
        return responseMessage(400, 'ID transaksi detail tidak valid', res)
    }

    const transaksiDetailId = parseInt(id)

    if(method === 'DELETE') {
        try {
            // Check if transaction detail exists
            const transactionDetail = await prisma.transaksidetail.findUnique({
                where: {
                    idTransaksiDetail: transaksiDetailId
                }
            });

            if (!transactionDetail) {
                return responseMessage(404, 'Detail transaksi tidak ditemukan', res);
            }

            // Delete the transaction detail
            await prisma.transaksidetail.delete({
                where: {
                    idTransaksiDetail: transaksiDetailId
                }
            });

            return responseMessage(200, 'Detail transaksi berhasil dihapus', res)
        } catch (error) {
            console.error('Error deleting transaction detail:', error)
            return responseMessage(500, 'Terjadi kesalahan saat menghapus detail transaksi', res)
        }
    }

    return responseMessage(405, 'Method not allowed', res)
}
