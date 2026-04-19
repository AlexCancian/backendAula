import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_EXPIRATION_MINUTES =
  Number(process.env.ACCESS_TOKEN_EXPIRATION_MINUTES) || 15;
const REFRESH_TOKEN_EXPIRATION_DAYS =
  Number(process.env.REFRESH_TOKEN_EXPIRATION_DAYS) || 30;

export const authConfig = {
  secret: process.env.SECRET ?? (() => { throw new Error("A variável de ambiente SECRET é obrigatória"); })(),
  jwt: {
    expiresIn: `${ACCESS_TOKEN_EXPIRATION_MINUTES}m`, // Formato string para jsonwebtoken ('15m')
  },
  refreshToken: {
    expiresInDays: REFRESH_TOKEN_EXPIRATION_DAYS, // Inteiro para cálculos de data
  },
  cookies: {
    accessToken: {
      maxAge: ACCESS_TOKEN_EXPIRATION_MINUTES * 60 * 1000, // Milissegundos
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
    },
    refreshToken: {
      maxAge: REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000, // Milissegundos
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
    },
  },
};
