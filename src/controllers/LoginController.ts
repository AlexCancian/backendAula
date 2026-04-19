import { NextFunction, Request, Response, Router } from "express";
import {
  authentication,
  refreshTokenUser,
  logout,
  solicitarRecuperacaoSenha,
  resetarSenha,
} from "../repositories/UserRepository";

const adminRouter = Router();

import { authConfig } from "../config/auth";

const setCookies = (res: Response, refreshToken: string) => {
  res.cookie("refresh_token", refreshToken, authConfig.cookies.refreshToken);
};

adminRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      // const { error } = await userLogin.validate(req.body, {
      //   abortEarly: false,
      // });
      // if (error) {
      //   throw { status: 401, message: error.details };
      // }
      const { token, refreshToken, user } = await authentication(req.body);

      setCookies(res, refreshToken.id);

      res.status(200).json({ user, token });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

adminRouter.post(
  "/refresh-token",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const refresh_token = req.cookies.refresh_token || req.body.refresh_token;

      if (!refresh_token) {
        throw { status: 401, message: "Refresh Token não fornecido" };
      }

      const { token, refreshToken, user } = await refreshTokenUser(
        refresh_token
      );

      setCookies(res, refreshToken.id);

      return res.status(200).json({ user, token });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const refresh_token = req.cookies.refresh_token || req.body.refresh_token;
      if (!refresh_token) {
        throw { status: 400, message: "Refresh Token não fornecido" };
      }
      const result = await logout(refresh_token);
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/forgot-password",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { email } = req.body;
      if (!email) throw { status: 400, message: "Email é obrigatório" };
      const result = await solicitarRecuperacaoSenha(email);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { code, newPassword } = req.body;
      if (!code || !newPassword)
        throw { status: 400, message: "Código e nova senha são obrigatórios" };
      const result = await resetarSenha(code, newPassword);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default adminRouter;
