import {
  buscarMensagensPendentes,
  marcarMensagemFalha,
  marcarMensagemSucesso,
  registrarLogEnvio,
} from "../repositories/mensagemService";
import { enviarWhatsApp } from "../repositories/whats";
import cron from "node-cron";

export async function processarMensagens() {
  const mensagens = await buscarMensagensPendentes();
  console.log(`Mensagens pendentes: ${mensagens.length}`);
  for (const mensagem of mensagens) {
    const { id, payload, tentativas } = mensagem;

    const enviado = await enviarWhatsApp(payload.telefone, payload.texto);

    if (enviado) {
      await marcarMensagemSucesso(String(id));
      await registrarLogEnvio(String(id), "sucesso");
    } else {
      await marcarMensagemFalha(String(id), Number(tentativas));
      await registrarLogEnvio(String(id), "falha", "Erro ao enviar");
    }
  }
}

export const startWhatsCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      await processarMensagens();
    } catch (e) {
      console.error("[CRON Whats] Erro na execução das mensagens:", e);
    }
  });
  console.log("Cron Whats.ts (mensagens pendentes) registrado.");
};
