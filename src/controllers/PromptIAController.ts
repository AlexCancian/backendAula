import { NextFunction, Request, Response, Router } from "express";
import { getPrompt, getPromptById, postPrompt, removePrompt, statusPromptIA, updatePrompt } from "../repositories/PromptRepository";


const promptIARouter = Router();

promptIARouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const prompt = await getPrompt();
      return res.status(200).json(prompt);
    } catch (error) {
      next(error);
    }
  }
);

promptIARouter.get(
  "/:id",
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const prompt = await getPromptById(Number(id));
    return res.status(200).json(prompt);
  }
);

promptIARouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      // const { error } = await empresaschema.validate(req.body, {
      //   abortEarly: false,
      // });
      // if (error) {
      //   throw { status: 401, message: error.details };
      // }
      const novoPromptIa = await postPrompt(req.body);
      return res.status(201).json(novoPromptIa);
    } catch (error) {
      next(error);
    }
  }
);

promptIARouter.put(
  "/atuaprompt/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      // const { error } = await Refschema.validate(req.body, {
      //   abortEarly: false,
      // });
      // if (error) {
      //   throw { status: 401, message: error.message };
      // }
      const { id } = req.params;
      const atualizarPrompt = await updatePrompt(Number(id), req.body);
      return res.status(200).json(atualizarPrompt);
    } catch (error) {
      next(error);
    }
  }
);

promptIARouter.patch(
  "/promptStatus/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const statusPrompt = await statusPromptIA(Number(id), status);
      return res.status(200).json(statusPrompt);
    } catch (error) {
      next(error);
    }
  }
);

promptIARouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const promptDeleted = await removePrompt(Number(id));
    return res.status(200).json(promptDeleted);
  } catch (error) {
    next(error);
  }
});

export default promptIARouter;
