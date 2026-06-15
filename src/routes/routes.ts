import { Router } from "express";
import userRouter from "../controllers/UserController";
import adminRouter from "../controllers/LoginController";
import diaSemanaRouter from "../controllers/DiaSemanaController";
import promptIARouter from "../controllers/PromptIAController";
import mensagemRouter from "../controllers/MensagemController";
import { authenticationMiddleware } from "../middlewares/auth.middleware";
import intervaloFuncionamentoRouter from "../controllers/IntervaloFuncionamentoController";
import jobRouter from "../controllers/JobController";
import whatsRouter from "../controllers/WhatsController";

const routers = Router();

routers.use("/admin", adminRouter);
routers.use("/user", userRouter);
routers.use("/dias", authenticationMiddleware, diaSemanaRouter);
routers.use("/prompt", authenticationMiddleware, promptIARouter);
routers.use("/mensagemEnviada", authenticationMiddleware, mensagemRouter);
routers.use("/intervaloFuncionamento", authenticationMiddleware, intervaloFuncionamentoRouter);
routers.use("/job", authenticationMiddleware, jobRouter);
routers.use("/whats", authenticationMiddleware, whatsRouter);

export default routers;
