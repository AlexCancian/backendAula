import { NextFunction, Request, Response, Router } from "express";
import {
  deletaMensagem,
  getMensagemById,
  getMensagens,
  getMensagensPaginadas,
  updateMensagem,
} from "../repositories/MensagensRepository";

const mensagemRouter = Router();

mensagemRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const mensagens = await getMensagens();
      return res.status(200).json(mensagens);
    } catch (error) {
      next(error);
    }
  },
);

mensagemRouter.get(
  "/pagina/",
  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const {
        page = "1",
        limit = "10",
        status,
      } = _req.query as {
        page?: string;
        limit?: string;
        status?: "pendente" | "enviado" | "falhou" | "cancelado";
      };
      let pageNum = Number(page) || 1;
      let sizeNum = Number(limit) || 10;
      if (pageNum < 1) pageNum = 1;
      if (sizeNum < 1) sizeNum = 10;
      if (sizeNum > 100) sizeNum = 100;

      const mensagens = await getMensagensPaginadas(pageNum, sizeNum, status);
      return res.status(200).json(mensagens);
    } catch (error) {
      next(error);
    }
  },
);

mensagemRouter.get(
  "/:id",
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const mensagem = await getMensagemById(Number(id));
    return res.status(200).json(mensagem);
  },
);

mensagemRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const atualizarMensagem = await updateMensagem(Number(id), req.body);
      return res.status(200).json(atualizarMensagem);
    } catch (error) {
      next(error);
    }
  },
);

mensagemRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deletar = await deletaMensagem(Number(id));
      return res.status(200).json(deletar);
    } catch (error) {
      next(error);
    }
  },
);

export default mensagemRouter;
