import connectionAgenda from "../dataBase/data";
import RefreshToken from "../entity/RefreshToken";
import { add, getUnixTime } from "date-fns";

import { authConfig } from "../config/auth";

class GenerateRefreshToken {
  async execute(userId: number) {
    const refreshTokenRepository = connectionAgenda.getRepository(RefreshToken);

    const expirationDate = add(new Date(), {
      days: authConfig.refreshToken.expiresInDays,
    });
    const expiresIn = getUnixTime(expirationDate);

    const generateRefreshToken = refreshTokenRepository.create({
      idUsuario: { idUsuario: userId } as any,
      expiresIn,
    });

    await refreshTokenRepository.save(generateRefreshToken);

    return generateRefreshToken;
  }
}

export { GenerateRefreshToken };
