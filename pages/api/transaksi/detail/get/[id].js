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

    if(method === 'GET') {
        try {
            const { id: dateStr } = req.query;
            const userId = auth.idAkun; // Get user ID from token
            console.log('Date string:', dateStr);
            console.log('User ID:', userId);
            
            if (!dateStr) {
                return responseMessage(400, 'Tanggal harus diisi', res);
            }

            // Get the date range for the given date (start of day to end of day)
            const date = new Date(dateStr);
            const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            
            console.log('Date range:', { startDate, endDate });

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
            console.log('Nasabah IDs for BSU:', nasabahIds);

            if (nasabahIds.length === 0) {
                return responseData(200, [], res);
            }

            // Get transactions for this date ONLY for nasabah in this BSU
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
                include: {
                    nasabah: true
                }
            });
            
            console.log('Found transactions:', transactions.length);

            // Then get all transaction details for these transactions
            const transactionIds = transactions.map(t => t.idTransaksi);
            console.log('Transaction IDs:', transactionIds);
            
            const transaksiDetails = await prisma.transaksidetail.findMany({
                where: {
                    transaksiId: {
                        in: transactionIds
                    }
                },
                include: {
                    jenissampah: true,
                    transaksi: {
                        include: {
                            nasabah: true
                        }
                    }
                }
            });
            
            console.log('Found transaction details:', transaksiDetails.length);

            // Get BSU prices for this specific BSU only
            const bsuPrices = await prisma.hargasampahbsu.findMany({
                where: {
                    bsuId: userId // Only get prices for the current BSU
                }
            });
            console.log('BSU Prices for current BSU:', bsuPrices);

            // Get BSI prices
            const jenisSampahIds = [...new Set(transaksiDetails.map(d => d.jenisSampahId))];
            const bsiPrices = await prisma.hargasampahbsi.findMany({
                where: {
                    jenisSampahId: {
                        in: jenisSampahIds
                    }
                }
            });
            console.log('BSI Prices:', bsiPrices);

            // Transform the data to match the table format
            const transformedData = transaksiDetails.map(detail => {
                // Cek apakah transaksi dari nasabah BSU
                const bsuId = detail.transaksi.nasabah.bsuId;
                const isBsuTransaction = !!bsuId;
                
                // Ambil harga sesuai dengan jenis transaksi (BSU/BSI)
                const hargaBsu = bsuPrices.find(h => h.bsuId === bsuId && h.jenisSampahId === detail.jenisSampahId)?.harga;
                const hargaBsi = bsiPrices.find(h => h.jenisSampahId === detail.jenisSampahId)?.harga;
                const hargaSatuan = detail.hargaSatuan || (isBsuTransaction ? hargaBsu : hargaBsi) || 0;
                
                const berat = detail.berat || 0;
                const totalHarga = detail.hargaTotal || (hargaSatuan * berat);

                return {
                    transaksiId: detail.transaksiId,
                    jenisSampahId: detail.jenisSampahId,
                    'nasabah.nama': detail.transaksi.nasabah.nama,
                    'jenisSampah.nama': detail.jenissampah.nama,
                    beratsampah: berat,
                    hargasatuan: hargaSatuan,
                    totalhargasampah: totalHarga,
                    nasabah: detail.transaksi.nasabah,
                    jenisSampah: detail.jenissampah
                };
            });

            return responseData(200, transformedData, res);
        } catch (error) {
            console.error('Error detail:', error);
            return responseMessage(500, error.message || 'Terjadi kesalahan pada server', res);
        }
    }

    return responseMessage(405, 'Method not allowed', res);
}
