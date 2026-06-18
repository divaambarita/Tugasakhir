import { responseData, responseMessage } from "@/lib/api/responHandler";
import { createRouter } from "next-connect";
import multer from "multer";
import path from "path";
import cloudinary from "cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

let storage = multer.memoryStorage();

let upload = multer({
  storage: storage,
});

const router = createRouter();
let uploadFile = upload.array("file");
router.use(uploadFile);
router.post(async (req, res) => {
    try {
      const data = [];
      const models = req.files;
      for (const model of models) {
        const b64 = Buffer.from(model.buffer).toString("base64");
        let dataURI = "data:" + model.mimetype + ";base64," + b64;
        const res = await cloudinary.uploader.upload(dataURI, {
          resource_type: "auto",
        });
        data.push({
          kategoriFile: req.body.kategori,
          originalName: model.originalname,
          path: res.url,
          extension: path.extname(model.originalname),
        });
      }
      return responseData(200, data, res);
    } catch (error) {
      return responseMessage(500, error.message, res);
    }
});
export default router.handler();
