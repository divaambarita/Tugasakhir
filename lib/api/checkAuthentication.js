import jwt from "jsonwebtoken";
import { responseData, responseMessage } from "./responHandler";

const verifyToken = function (req, res) {
    try {
        const token = req.headers.authorization
        if (token == undefined || !token) {
          const data = {
            status:401,
            message: "authenticated"
          }
          return data;
        }

    const decodToken = jwt.verify(token.split(" ")[1], process.env.SECRET_KEY_JWT);
    return decodToken
  } catch (error) {
    const data = {
      status:401,
      message: error.message
    }
    return data;
  }
};

module.exports = { verifyToken };
