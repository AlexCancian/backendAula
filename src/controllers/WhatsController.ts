import { Router, Request, Response } from "express";
import { currentQrCode, requestPairingCode, clearSession, initWhatsApp, client, getClientStatus } from "../repositories/whats";

const whatsRouter = Router();

whatsRouter.get("/status", async (req: Request, res: Response): Promise<any> => {
    const statusObj = getClientStatus();
    return res.json(statusObj);
});

whatsRouter.get("/qrcode", async (req: Request, res: Response): Promise<any> => {
    if (client) {
        if (currentQrCode) {
            console.log("chegou aqui")
            return res.json({ qrcode: currentQrCode, message: "Acompanhe as atualizações do status pelo WebSocket em tempo real." });
        }
        return res.status(200).json({ message: "Sessão já iniciada ou gerando novo QR... Acompanhe no WebSocket." });
    }

    // Inicia o Baileys com a regra de gerar QR Code
    initWhatsApp({ type: "qr" });

    return res.status(200).json({
        message: "Iniciando processo do WhatsApp via QR Code. Atualizações serão disparadas no Socket.io pro Front-end."
    });
});

whatsRouter.get("/pairingCode", async (req: Request, res: Response): Promise<any> => {
    const phone = req.query.phone as string;
    console.log(phone)

    if (!phone) {
        return res.status(400).json({ error: "Número de telefone 'phone' é obrigatório via query param" });
    }

    if (client) {
        // Se já está iniciado, pedimos o código direto
        try {
            const code = await requestPairingCode(phone);
            return res.json({ pairingCode: code, message: "Código disparado no canal Socket.io para o Front end." });
        } catch (error: any) {
            return res.status(500).json({ error: error.message || "Erro ao solicitar pairing code" });
        }
    }

    // Inicia o Baileys com a regra de Phone
    initWhatsApp({ type: "pairingCode", phone });

    return res.status(200).json({
        message: "Iniciando processo de WhatsApp via Pairing Code. Atualizações serão disparadas no canal Socket.io."
    });
});

whatsRouter.delete("/clearSession", async (req: Request, res: Response): Promise<any> => {
    const success = await clearSession();
    if (success) {
        return res.json({ message: "Sessão limpa com sucesso. Status atualizados via WebSocket." });
    } else {
        return res.status(500).json({ error: "Falha ao limpar sessão" });
    }
});

export default whatsRouter;
