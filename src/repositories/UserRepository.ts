import connectionAgenda from "../dataBase/data";
import User from "../entity/User";
import IAuthParametros from "../interfaces/IAuthParametros";
import IUser from "../interfaces/IUser";
import bcrypt from "bcrypt";
import { generateJWTToken } from "../utils/jwt";
import ISenha from "../interfaces/IAtuaSenha";
import { GenerateRefreshToken } from "../providers/GenerateRefreshToken";
import RefreshToken from "../entity/RefreshToken";
import { getUnixTime } from "date-fns";
import crypto from "crypto";
import { MailProvider } from "../providers/MailProvider";
import { authConfig } from "../config/auth";
import { Algorithm } from "jsonwebtoken";

const userRepository = connectionAgenda.getRepository(User);
const jwtConfig = {
  expiresIn: authConfig.jwt.expiresIn,
  algorithm: "HS256" as Algorithm,
};

const getUsuarios = async (): Promise<IUser[]> => {
  const data = await userRepository.find();
  return data;
};

const getUsuariosAtivos = async (): Promise<IUser[]> => {
  const data = await userRepository.find({ where: { status: true } });
  return data;
};

const getUsuarioById = async (idUsuario: number): Promise<any> => {
  const usuario = await userRepository.findOneBy({ idUsuario });
  if (!usuario) {
    return { status: 404, message: "id não existe" };
  }
  return usuario;
};

const postUsuario = async (novoUser: IUser): Promise<any> => {


  const newUser = new User();
  newUser.nome = novoUser.nome;
  newUser.apelido = novoUser.apelido;
  newUser.cpf = novoUser.cpf;
  newUser.status = novoUser.status;
  newUser.email = novoUser.email;
  newUser.senha = novoUser.senha;
  await userRepository.save(newUser);
  return newUser;
}

const authentication = async ({ login, senha }: IAuthParametros) => {
  try {
    if (!login || !senha) {
      throw { status: 401, message: "Campos faltantes." };
    }

    const usuario = await userRepository
      .createQueryBuilder("user")
      .addSelect("user.senha")
      .where("user.email = :login OR user.cpf = :login", { login })
      .getOne();

    if (usuario && usuario.status === true) {
      const comparePassword = bcrypt.compareSync(senha, usuario.senha);
      if (!comparePassword) {
        throw { status: 401, message: "Usuário ou senha inválidos" };
      }
      const id = usuario.idUsuario;

      const token = await generateJWTToken(
        {
          id,
        },
        authConfig.secret,
        jwtConfig
      );

      // Remove tokens expirados do usuário antes de gerar um novo
      const refreshTokenRepo = connectionAgenda.getRepository(RefreshToken);
      const currentTimestamp = getUnixTime(new Date());

      await refreshTokenRepo
        .createQueryBuilder()
        .delete()
        .from(RefreshToken)
        .where("idUsuario = :id", { id })
        .andWhere("expiresIn < :now", { now: currentTimestamp })
        .execute();

      const generateRefreshToken = new GenerateRefreshToken();
      const refreshToken = await generateRefreshToken.execute(id);

      return { token, refreshToken, user: { id: usuario.idUsuario } };
    } else {
      throw { status: 401, message: "Usuario não cadastrado" };
    }
  } catch (error: any) {
    if (error.status && error.message) {
      throw error;
    } else {
      throw { status: 500, message: "Ocorreu um erro interno no servidor" };
    }
  }
};

const atualizarSenha = async (id: number, senha: ISenha) => {
  try {
    const usuario = await userRepository
      .createQueryBuilder("user")
      .addSelect("user.senha")
      .where("user.idUsuario = :id", { id })
      .getOne();

    if (usuario) {
      const comparePassword = bcrypt.compareSync(senha.senha, usuario.senha);

      if (!comparePassword) {
        throw { status: 401, message: "Senha principal inválida" };
      } else {
        const atualiza = await userRepository.update(id, {
          senha: senha.senhacrypto,
        });
        return `Senha do usuario ${usuario.nome} atualizada com sucesso`;
      }
    } else {
      throw { status: 401, message: "Usuario não existe no banco de dados" };
    }
  } catch (error: any) {
    if (error.status && error.message) {
      throw error;
    } else {
      throw { status: 500, message: "Ocorreu um erro interno no servidor" };
    }
  }
};

const updateUser = async (idUsuario: number, userAtualizar: IUser) => {
  try {
    const usuario = await userRepository.findOneBy({ idUsuario });
    if (!usuario) {
      return { status: 404, message: "id não existe" };
    }

    const alteraUsuario = await userRepository.update(idUsuario, {
      nome: userAtualizar.nome,
      apelido: userAtualizar.apelido,
      cpf: userAtualizar.cpf,
      status: userAtualizar.status,
      email: userAtualizar.email
    });
    return { status: 202, message: "Usuario atualizado com sucesso" };
  } catch (error) {
    throw error;
  }
};

const desativaUsuario = async (id: number, status: boolean) => {
  try {
    const desativarUsuario = await userRepository.update(id, { status: status });
    return "Usuario atualizado com sucesso";
  } catch (error) {
    throw error;
  }
};

const removeUsuario = async (idUsuario: number): Promise<any> => {
  try {
    const usuarioExist = await userRepository.findOneBy({ idUsuario });
    if (!usuarioExist) {
      return { status: 404, message: "id não existe" };
    }
    await userRepository.delete(idUsuario);
    return { status: 200, message: "Usuario removido com sucesso" };
  } catch (error) {
    throw error;
  }
};

const refreshTokenUser = async (refresh_token: string) => {
  try {
    const refreshTokenRepository = connectionAgenda.getRepository(RefreshToken);
    const refreshTokenRecord = await refreshTokenRepository.findOne({
      where: { id: refresh_token },
      relations: ["idUsuario"],
    });

    if (!refreshTokenRecord) {
      throw { status: 401, message: "Refresh Token inválido" };
    }

    const currentTimestamp = getUnixTime(new Date());

    if (currentTimestamp > refreshTokenRecord.expiresIn) {
      // Remove token expirado
      await refreshTokenRepository.delete(refresh_token);
      throw { status: 401, message: "Refresh Token expirado" };
    }

    const { idUsuario } = refreshTokenRecord.idUsuario;

    const token = await generateJWTToken(
      {
        id: idUsuario
      },
      authConfig.secret,
      jwtConfig
    );

    // Rotação de Refresh Token (opcional, mas recomendado)
    // Apaga o antigo
    await refreshTokenRepository.delete(refresh_token);

    // Gera um novo
    const generateRefreshToken = new GenerateRefreshToken();
    const newRefreshToken = await generateRefreshToken.execute(idUsuario);

    return { token, refreshToken: newRefreshToken, user: { id: idUsuario } };
  } catch (error: any) {
    if (error.status && error.message) {
      throw error;
    } else {
      throw { status: 500, message: "Ocorreu um erro interno no servidor" };
    }
  }
};

const logout = async (refresh_token: string) => {
  try {
    const refreshTokenRepository = connectionAgenda.getRepository(RefreshToken);
    await refreshTokenRepository.delete(refresh_token);
    return { message: "Logout realizado com sucesso" };
  } catch (error) {
    throw error;
  }
};

const solicitarRecuperacaoSenha = async (email: string) => {
  try {
    const usuario = await userRepository.findOneBy({ email });
    if (!usuario) {
      throw { status: 404, message: "Usuário não encontrado" };
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 6; i++) {
      codigo += chars.charAt(crypto.randomInt(0, chars.length));
    }
    await userRepository.update(usuario.idUsuario, { codigoRecuperacao: codigo });

    const mailProvider = new MailProvider();
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
          .container { width: 100%; padding: 40px 0; display: flex; justify-content: center; align-items: center; }
          .card { background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); width: 90%; max-width: 450px; padding: 40px; text-align: center; margin: 0 auto; }
          .logo { color: #1FA84F; font-size: 24px; font-weight: bold; margin-bottom: 30px; letter-spacing: 1px; }
          .title { color: #333333; font-size: 20px; font-weight: 600; margin-bottom: 20px; }
          .description { color: #666666; font-size: 15px; margin-bottom: 30px; line-height: 1.5; }
          .code-container { background-color: #f0fff4; border: 2px dashed #1FA84F; border-radius: 8px; padding: 20px; margin: 25px 0; display: inline-block; min-width: 200px; }
          .code { font-size: 32px; font-weight: 800; color: #1FA84F; letter-spacing: 6px; }
          .footer { color: #999999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">CAMNPAL</div>
            <div class="title">Recuperação de Senha</div>
            <p class="description">Recebemos uma solicitação para redefinir sua senha. Utilize o código de verificação abaixo para prosseguir com o processo:</p>
            <div class="code-container">
              <span class="code">${codigo}</span>
            </div>
            <p class="description">Se você não solicitou esta alteração, por favor ignore este e-mail por motivos de segurança.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Equipe CAMNPAL</p>
              <p>Este é um e-mail automático, por favor não responda.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailProvider.sendMail(
      email,
      "Recuperação de Senha",
      htmlBody
    );

    return { message: "Código enviado para o email" };
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    if (error.status) throw error;
    throw { status: 500, message: "Erro ao enviar email de recuperação" };
  }
};

const resetarSenha = async (codigo: string, novaSenha: string) => {
  try {
    const usuario = await userRepository.findOneBy({ codigoRecuperacao: codigo });
    if (!usuario) {
      throw { status: 400, message: "Código inválido" };
    }
    const senhaHash = bcrypt.hashSync(novaSenha, 8);
    await userRepository.update(usuario.idUsuario, {
      senha: senhaHash,
      codigoRecuperacao: null as any,
    });

    return { message: "Senha alterada com sucesso" };
  } catch (error: any) {
    if (error.status) throw error;
    throw { status: 500, message: "Erro ao resetar senha" };
  }
};

export {
  getUsuarios,
  postUsuario,
  getUsuariosAtivos,
  getUsuarioById,
  authentication,
  atualizarSenha,
  desativaUsuario,
  removeUsuario,
  refreshTokenUser,
  logout,
  solicitarRecuperacaoSenha,
  resetarSenha,
  updateUser
};
