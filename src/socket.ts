import { Server } from "socket.io";
import http from "http";
import { authConfig } from "./config/auth";
import { authenticateToken } from "./utils/jwt";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
  });

  io.use(async (socket, next) => {
    try {
      // Extrai token apenas de handshake.auth (recomendado para Socket.io)
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Token ausente"));
      }

      const payload = await authenticateToken(token, authConfig.secret);

      if (!payload) {
        return next(new Error("Token inválido"));
      }

      socket.data.user = payload; // Salva o payload no socket
      next();
    } catch (error) {
      next(new Error("Não autorizado"));
    }
  });

  io.on("connection", (socket) => {
    console.log(" Novo cliente web conectado ao WebSocket:", socket.id);
    
    socket.on("disconnect", () => {
      console.log(" Cliente desconectado do WebSocket:", socket.id);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    console.warn("Socket.io não inicializado ainda!");
  }
  return io;
};
