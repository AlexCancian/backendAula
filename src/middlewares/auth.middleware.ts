import { authConfig } from "../config/auth";
import { authenticateToken } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";

const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: "Token ausente" });
    }

    const payload = await authenticateToken(token, authConfig.secret);

    if (!payload) {
      throw { status: 401, message: "token inválido" };
    }
    res.locals.payload = payload;
    next();
  } catch (error) {
    next(error);
  }
};
export { authenticationMiddleware };
