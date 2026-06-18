import { responseData, responseMessage } from "@/lib/api/responHandler";
import prisma from "@/lib/api/prisma";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const data = await prisma.bsu.findMany({
                where:{
                    status:'Approved',
                    isActive:1,
                    deletedAt:null
                },
                select:{
                    idBsu:true,
                    nama:true
                }
            })
            return responseData(200, data, res)
        } catch (error) {
            return responseMessage(500, error.message, res)
        }
    } else {
        return responseMessage(401, 'Not Found', res)
    }
  }