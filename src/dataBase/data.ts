import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import User from "../entity/User";
import DiasSemana from "../entity/DiasSemana";
import Mensagens from "../entity/MensagensClientes";
import Prompt from "../entity/PromptIA";
import RefreshToken from "../entity/RefreshToken";
import IntervaloFuncionamento from "../entity/IntervaloFuncionamento";
import path from "path";
import Audit from "../entity/Audit";
import LogEnvio from "../entity/Logs";
import Job from "../entity/Job";

dotenv.config();

const connectionAgenda = new DataSource({
  type: "mysql",
  host: process.env.DB_HOSTNAME,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  extra: { decimalNumbers: true },
  logging: false,
  entities: [
    User,
    DiasSemana,
    Mensagens,
    Prompt,
    RefreshToken,
    Audit,
    IntervaloFuncionamento,
    LogEnvio,
    Job
  ],
  migrations: [path.join(__dirname, "../migration/*.{ts,js}")],
  subscribers: [],
  timezone: "Z",
});

export default connectionAgenda;
