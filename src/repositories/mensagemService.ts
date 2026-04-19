import { LessThanOrEqual } from "typeorm";
import connectionWhats from "../dataBase/data";
import Mensagens from "../entity/MensagensClientes";
import LogEnvio from "../entity/Logs"
import IMensagens from "../interfaces/IMensagens";

const MAX_TENTATIVAS = parseInt(process.env.MAX_TENTATIVAS || "3");

const mensagens = connectionWhats.getRepository(Mensagens);
const logsEnvioMensagem = connectionWhats.getRepository(LogEnvio);
const buscarMensagensPendentes = async (): Promise<IMensagens[]> => {
  const agora = new Date();
  agora.setHours(agora.getHours() - 3);
  console.log("Data atual (UTC):", agora);
  const data = await mensagens.find({
    where: {
      status: "pendente",
      agendaPara: LessThanOrEqual(agora),
    },
  });

  // Processa no máximo 20 por vez para evitar sobrecarga

  return data;
};

const marcarMensagemSucesso = async (id: string) => {
  try {
    await mensagens.update(id, { status: "enviado" });
    return { status: 202, message: "Agenda alterada com sucesso" };
  } catch (error) {
    throw error;
  }
};

const marcarMensagemFalha = async (id: string, tentativasAtuais: number) => {
  try {
    if (tentativasAtuais + 1 >= MAX_TENTATIVAS) {
      await mensagens.update(id, {
        status: "falhou",
        tentativas: tentativasAtuais + 1,
      });
    } else {
      await mensagens.update(id, { tentativas: tentativasAtuais + 1 });
    }
  } catch (error) {
    throw error;
  }
};

const registrarLogEnvio = async (
  idMensagem: string,
  status: "sucesso" | "falha",
  erro?: string
) => {
  try {
    const log = logsEnvioMensagem.create({
      idMensagem,
      status,
      erro: erro || undefined,
    });
    await logsEnvioMensagem.save(log);
  } catch (error) {
    throw error;
  }
};

export {
  buscarMensagensPendentes,
  marcarMensagemSucesso,
  marcarMensagemFalha,
  registrarLogEnvio,
};
