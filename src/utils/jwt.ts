import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateJWTToken = (payload: any, secret: string, jwtConfig: any) =>
  jwt.sign(payload, secret, jwtConfig as jwt.SignOptions);

const authenticateToken = async (token: string, secret: string) => {

  try {
    const introspection = jwt.verify(token, secret);
    return introspection;
  } catch {
    throw { status: 401, message: "token inválido" };
  }
};

export { generateJWTToken, authenticateToken };
