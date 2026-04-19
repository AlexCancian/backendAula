import { NextFunction, Request, Response, Router } from "express";
import {
    deleteIntervalo,
    getIntervaloById,
    getIntervalos,
    getIntervalosByDiaSemana,
    postIntervalo,
    updateIntervalo,
    updateIntervaloStatus
} from "../repositories/IntervaloFuncionamentoRepository";

const intervaloFuncionamentoRouter = Router();

intervaloFuncionamentoRouter.get(
    "/",
    async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const intervalos = await getIntervalos();
            return res.status(200).json(intervalos);
        } catch (error) {
            next(error);
        }
    }
);

intervaloFuncionamentoRouter.get(
    "/dia/:diaSemana",
    async (req: Request, res: Response): Promise<any> => {
        const { diaSemana } = req.params;
        const intervalo = await getIntervalosByDiaSemana(Number(diaSemana));
        return res.status(200).json(intervalo);
    }
);

intervaloFuncionamentoRouter.get(
    "/:id",
    async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const intervalo = await getIntervaloById(Number(id));
        return res.status(200).json(intervalo);
    }
);

intervaloFuncionamentoRouter.post(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const novo = await postIntervalo(req.body);
            return res.status(201).json(novo);
        } catch (error) {
            next(error);
        }
    }
);

intervaloFuncionamentoRouter.put(
    "/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { id } = req.params;
            const att = await updateIntervalo(Number(id), req.body);
            return res.status(200).json(att);
        } catch (error) {
            next(error);
        }
    }
);

intervaloFuncionamentoRouter.patch(
    "/status/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { id } = req.params;
            const att = await updateIntervaloStatus(Number(id), req.body.status);
            return res.status(200).json(att);
        } catch (error) {
            next(error);
        }
    }
);

intervaloFuncionamentoRouter.delete(
    "/:id",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { id } = req.params;
            const deleted = await deleteIntervalo(Number(id));
            return res.status(200).json(deleted);
        } catch (error) {
            next(error);
        }
    }
);

export default intervaloFuncionamentoRouter;
