import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import fs from "fs";
import path from "path";
import { getIo } from "../socket";

const sendWebhook = async (event: string, data: any) => {
  const io = getIo();
  if (io) {
    io.emit("whatsapp_status", { event, data, timestamp: Date.now() });
    console.log(`✅ Evento via Socket emitido (${event}) disparado com sucesso`);
  }
};

export let client: WASocket | null = null;
export let currentQrCode: string = "";

const getSessionName = () => process.env.SESSION_NAME || "session";

export const getClientStatus = () => {
  if (!client) return { status: "Desconectado" };
  if (currentQrCode) return { status: "qr", qrcode: currentQrCode };
  if (client.user || client.authState?.creds?.registered) return { status: "connected" };
  return { status: "connecting" };
};

export interface InitConfig {
  type: "qr" | "pairingCode";
  phone?: string;
  webhookUrl?: string; // Opt in case they want to pass it dynamically
}

const initWhatsApp = async (config?: InitConfig) => {
  // Se passar via config, podemos setar provisoriamente
  if (config?.webhookUrl) {
    process.env.WEBHOOK_URL = config.webhookUrl;
  }

  if (client) {
    console.log("WhatsApp Web já está em execução.");
    sendWebhook("whatsapp_status", { message: "WhatsApp Web já está em execução.", status: "started" });
    return;
  }

  const sessionName = getSessionName();
  const { state, saveCreds } = await useMultiFileAuthState(sessionName);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`Usando Baileys v${version.join(".")}, isLatest: ${isLatest}`);
  sendWebhook("whatsapp_status", { message: "Iniciando cliente", status: "initializing" });

  client = makeWASocket({
    version,
    logger: pino({ level: "silent" }) as any,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }) as any),
    },
  });

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("QR Code recebido. Pronto para leitura.");
      currentQrCode = qr;
      sendWebhook("whatsapp_status", { status: "qr", qrCode: qr });
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      const reason = (lastDisconnect?.error as Boom)?.message || "Desconhecido";
      console.log(
        "Conexão fechada devido a ",
        reason,
        ", reconectando ",
        shouldReconnect
      );

      if (shouldReconnect) {
        sendWebhook("whatsapp_status", { status: "reconnecting", reason });

        // Destruir e recriar
        client = null;
        initWhatsApp(config);
      } else {
        console.log("Conexão encerrada pelo usuário.");
        currentQrCode = "";
        sendWebhook("whatsapp_status", { status: "disconnected", reason });
        client = null;
      }
    } else if (connection === "open") {
      console.log("✅ Conexão aberta com sucesso!");
      currentQrCode = ""; // Limpa o QR após conectar
      sendWebhook("whatsapp_status", { status: "connected" });
    }
  });

  client.ev.on("creds.update", saveCreds);

  // Solicitar pairing code assim que criamos o client se não tivermos registro
  if (config?.type === "pairingCode" && config.phone && !state.creds.registered) {
    setTimeout(async () => {
      try {
        let cleanNumber = config.phone!.replace(/\D/g, "");
        const code = await client!.requestPairingCode(cleanNumber);
        console.log(`\n--- CÓDIGO DE PAREAMENTO: ${code} ---\n`);
        sendWebhook("whatsapp_status", { status: "pairingCode", pairingCode: code });
      } catch (err: any) {
        console.error("Erro ao solicitar código de pareamento no início:", err);
        sendWebhook("whatsapp_status", { status: "error", message: err.message });
      }
    }, 2000);
  }
};

const requestPairingCode = async (phoneNumber: string): Promise<string> => {
  if (!client) {
    throw new Error("Client WhatsApp não está inicializado.");
  }
  if (client.authState.creds.registered) {
    throw new Error("O WhatsApp já está registrado e conectado.");
  }

  let cleanNumber = phoneNumber.replace(/\D/g, "");
  console.log(`\nSolicitando código de pareamento para: ${cleanNumber}...`);

  try {
    const code = await client.requestPairingCode(cleanNumber);
    console.log(`\n--- CÓDIGO DE PAREAMENTO: ${code} ---\n`);
    return code;
  } catch (err) {
    console.error("Erro ao solicitar código de pareamento:", err);
    throw err;
  }
};

const clearSession = async (): Promise<boolean> => {
  try {
    const sessionName = getSessionName();
    if (client) {
      client.logout();
      client = null;
    }
    const sessionPath = path.resolve(process.cwd(), sessionName);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }
    console.log("Sessão limpa com sucesso. Aguardando nova requisição de conexão...");
    currentQrCode = "";
    sendWebhook("whatsapp_status", { status: "disconnected", reason: "Sessão limpa pelo usuário." });

    return true;
  } catch (error) {
    console.error("Erro ao limpar sessão:", error);
    return false;
  }
};

const enviarWhatsApp = async (numero: string, mensagem: string): Promise<boolean> => {
  try {
    if (!client) {
      console.error("Client WhatsApp não está inicializado.");
      return false;
    }

    let cleanNumber = numero.replace(/\D/g, "");

    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = "55" + cleanNumber;
    }

    const id = `${cleanNumber}@s.whatsapp.net`;

    if (!client.user) {
      console.warn("WhatsApp ainda conectando... aguardando 5s");
      await new Promise(r => setTimeout(r, 5000));
    }

    console.log(`Verificando existência do número: ${id}`);
    const results = await client.onWhatsApp(id);
    const result = results?.[0];

    if (!result || !result.exists) {
      console.error(`❌ Número não registrado no WhatsApp: ${id} (Original: ${numero})`);
      return false;
    }

    const finalId = result.jid;

    await client.sendMessage(finalId, { text: mensagem });
    console.log(`✅ Mensagem enviada para ${finalId}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar para ${numero}:`, error);
    return false;
  }
};

const startExistingSession = async () => {
  const sessionName = getSessionName();
  const sessionPath = path.resolve(process.cwd(), sessionName);
  const credsPath = path.join(sessionPath, "creds.json");

  if (fs.existsSync(credsPath)) {
    console.log("Sessão ativa de WhatsApp existente encontrada. Inicializando retomada automática...");
    await initWhatsApp();
  } else {
    console.log("Nenhuma sessão WhatsApp existente encontrada. Aguardando emparelhamento manual via front-end.");
  }
};

export { initWhatsApp, enviarWhatsApp, requestPairingCode, clearSession, startExistingSession };
