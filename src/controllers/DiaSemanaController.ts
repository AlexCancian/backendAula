import { NextFunction, Request, Response, Router } from "express";
import { desativaDiaSemana, getDiaSemanaById, getDiasSemana, updateDiaSemana, postDiaSemana, deleteDiaSemana } from "../repositories/DiaSemanaRepository";


const diaSemanaRouter = Router();

diaSemanaRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const DiasSemana = await getDiasSemana();
      return res.status(200).json(DiasSemana);
    } catch (error) {
      next(error);
    }
  }
);

diaSemanaRouter.get(
  "/:id",
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const diaSemana = await getDiaSemanaById(Number(id));
    return res.status(200).json(diaSemana);
  }
);

diaSemanaRouter.put(
  "/atuaDiaSemana/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      // const { error } = await Refschema.validate(req.body, {
      //   abortEarly: false,
      // });
      // if (error) {
      //   throw { status: 401, message: error.message };
      // }
      const { id } = req.params;
      const atualizarDiaSemana = await updateDiaSemana(Number(id), req.body);
      return res.status(200).json(atualizarDiaSemana);
    } catch (error) {
      next(error);
    }
  }
);

diaSemanaRouter.patch(
  "/DiaSemanaStatus/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      const desativarDiaSemana = await desativaDiaSemana(Number(id), ativo);
      return res.status(200).json(desativarDiaSemana);
    } catch (error) {
      next(error);
    }
  }
);

diaSemanaRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const novoDia = await postDiaSemana(req.body);
      return res.status(201).json(novoDia);
    } catch (error) {
      next(error);
    }
  }
);

diaSemanaRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const result = await deleteDiaSemana(Number(id));
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default diaSemanaRouter;
