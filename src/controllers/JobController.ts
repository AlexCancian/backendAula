import { NextFunction, Request, Response, Router } from "express";
import upload from "../middlewares/uploadMiddleware";
import { clearS3Bucket, uploadFileToS3 } from "../utils/s3Config";
import { createJob, getJobs } from "../repositories/JobRepository";
import { processPendingJob } from "../worker/jobWorker";

const jobRouter = Router();

jobRouter.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado. Anexe um .xlsx file" });
      }

      const { idTipoMensagem } = req.body;
      if (!idTipoMensagem) {
        return res.status(400).json({ message: "O campo idTipoMensagem é obrigatório" });
      }

      // 1. Upload to Railway Bucket
      const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
      const urlDoBucket = await uploadFileToS3(req.file.buffer, fileName, req.file.mimetype);

      // 2. Create Job in DB
      const novoJob = await createJob(urlDoBucket, Number(idTipoMensagem));

      // 3. Trigger immediate processing in the background (fire and forget)
      processPendingJob();

      return res.status(201).json(novoJob);
    } catch (error) {
      next(error);
    }
  }
);

jobRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const jobs = await getJobs();
      return res.status(200).json(jobs);
    } catch (error) {
      next(error);
    }
  }
);

jobRouter.delete("/clear", async (_req: Request, res: Response): Promise<any> => {
  try {
    await clearS3Bucket();
    return res.status(200).json({ message: "Bucket limpo com sucesso." });
  } catch (error: any) {
    console.error("Erro na rota de limpar bucket:", error);
    return res.status(500).json({
      message: "Erro ao limpar o bucket do S3",
      error: error.message
    });
  }
});

export default jobRouter;
