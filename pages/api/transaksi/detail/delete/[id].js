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
            const { transaksiId, jenisSampahId } = req.body;
            const userId = auth.idAkun;
            
            console.log('Request body:', req.body);

            if (!transaksiId || !jenisSampahId) {
                return responseMessage(400, 'transaksiId dan jenisSampahId diperlukan', res);
            }

            // First, verify BSU ownership by checking the transaction
            const transaction = await prisma.transaksi.findFirst({
                where: {
                    idTransaksi: parseInt(transaksiId),
                },
                include: {
                    nasabah: true,
                },
            });

            if (!transaction) {
                return responseMessage(404, "Transaksi tidak ditemukan", res);
            }

            // Verify BSU ownership - only allow deleting transactions from the same BSU
            if (transaction.nasabah.bsuId !== userId) {
                return responseMessage(403, "Tidak memiliki akses untuk menghapus transaksi ini", res);
            }

            // Delete specific transaction detail using composite key
            const deletedDetail = await prisma.transaksidetail.delete({
                where: {
                    transaksiId_jenisSampahId: {
                        transaksiId: parseInt(transaksiId),
                        jenisSampahId: parseInt(jenisSampahId)
                    }
                }
            });

            console.log('Deleted detail:', deletedDetail);

            return responseMessage(200, 'Detail transaksi berhasil dihapus', res)
        } catch (error) {
            console.error('Error deleting transaction detail:', error)
            return responseMessage(500, error.message, res)
        }
    }

    return responseMessage(405, 'Method not allowed', res)
}
