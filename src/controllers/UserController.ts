import { NextFunction, Request, Response, Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  updateAdminStatusSchema,
  updateSenhaSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userSchema,
} from "../utils/schemas";
import {
  atualizarSenha,
  desativaUsuario,
  getUsuarioById,
  getUsuarios,
  getUsuariosAtivos,
  postUsuario,
  removeUsuario,
  updateUser
} from "../repositories/UserRepository";
import bcrypt from "bcrypt";

import { authenticationMiddleware } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get(
  "/", authenticationMiddleware,

  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const usuarios = await getUsuarios();
      return res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  },
);

userRouter.get(
  "/ativo/", authenticationMiddleware,

  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const usuarios = await getUsuariosAtivos();
      return res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  },
);

userRouter.get(
  "/:id", authenticationMiddleware,

  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const usuario = await getUsuarioById(Number(id));
    return res.status(200).json(usuario);
  },
);

userRouter.post(
  "/",
  validate(userSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const novoUsuario = await postUsuario(req.body);
      return res.status(201).json(novoUsuario);
    } catch (error) {
      next(error);
    }
  },
);


userRouter.put(
  "/atuaSenha/:id", authenticationMiddleware,

  validate(updateSenhaSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const { senha, novaSenha } = req.body;
      const senhacrypto = bcrypt.hashSync(novaSenha, 8) as string;
      const senhaUpdated = await atualizarSenha(Number(id), {
        senha,
        senhacrypto,
      });
      return res.status(200).json(senhaUpdated);
    } catch (error) {
      next(error);
    }
  },
);

userRouter.put(
  "/atuaUser/:id", authenticationMiddleware,
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const atualizarUser = await updateUser(Number(id), req.body);
      return res.status(200).json(atualizarUser);
    } catch (error) {
      next(error);
    }
  },
);

userRouter.patch(
  "/userStatus/:id", authenticationMiddleware,

  validate(updateUserStatusSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const desativaUser = await desativaUsuario(Number(id), status);
      return res.status(200).json(desativaUser);
    } catch (error) {
      next(error);
    }
  },
);

userRouter.delete("/:id", authenticationMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const empresaDeleted = await removeUsuario(Number(id));
    return res.status(200).json(empresaDeleted);
  } catch (error) {
    next(error);
  }
});

export default userRouter;
