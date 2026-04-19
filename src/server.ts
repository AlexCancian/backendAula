import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware";
import routers from "./routes/routes";
import connectionAgenda from "./dataBase/data";
import cookieParser from "cookie-parser";
import { startJobWorker } from "./worker/jobWorker";
import { initSocket } from "./socket";
import { createServer } from "http";
import net from "net";
import { startWhatsCron } from "./utils/cron";
import { startExistingSession } from "./repositories/whats";

const app = express();
const serverHttp = createServer(app);

initSocket(serverHttp);
app.set("trust proxy", 1);
app.get("/", (req, res) => {
  res.send(`<h1>Bem-vindo ao CRUD da Agenda!</h1>`);
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use(routers);

app.use(errorMiddleware);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const wakeDb = (
  host: string,
  port: number,
  timeoutMs = 3000
): Promise<boolean> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    socket.setTimeout(timeoutMs);

    socket.once("connect", () => {
      done = true;
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once("error", () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
};

const start = async () => {
  const host = process.env.DB_HOSTNAME || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const wakeWaitMs = Number(process.env.DB_WAKE_WAIT_MS) || 5000; // 5s
  const maxAttempts = Number(process.env.DB_MAX_INIT_ATTEMPTS) || 3;
  const attemptDelay = Number(process.env.DB_INIT_ATTEMPT_DELAY_MS) || 5000;

  console.log(`Tentando acordar o banco de dados...`);
  const pinged = await wakeDb(host, port);
  if (pinged) {
    console.log("Requisição TCP enviada ao banco (possível wakeup).");
  } else {
    console.warn(
      "Não foi possível estabelecer TCP com o DB — ainda assim aguardando o tempo de boot."
    );
  }

  console.log(
    `Aguardando ${wakeWaitMs / 1000} segundos para o banco aquecer...`
  );
  await sleep(wakeWaitMs);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await connectionAgenda.initialize();
      console.log("Database Agenda iniciado");

      startJobWorker(); // Inicia o schedule do job worker após conexão com o DB
      startWhatsCron(); // Inicia o envio de whats via fila do native cron
      
      // Auto-reconeta o WhatsApp Web na inicialização da API se houver uma pasta de credenciais existente
      await startExistingSession();

      serverHttp.listen(process.env.PORT || 3335, () => {
        console.log(`Server (com WebSocket) started on port ${process.env.PORT || 3335}!`);
      });

      return;
    } catch (error) {
      console.error(
        `Erro ao iniciar Database Agenda (tentativa ${attempt}):`,
        error
      );
      if (attempt < maxAttempts) {
        console.log(
          `Aguardando ${attemptDelay / 1000}s antes da próxima tentativa...`
        );
        await sleep(attemptDelay);
      } else {
        console.error(
          "Não foi possível conectar ao banco após várias tentativas. Encerrando."
        );
        process.exit(1);
      }
    }
  }
};

start();