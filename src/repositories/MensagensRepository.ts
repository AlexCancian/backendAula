import { paginate, Pagination } from "nestjs-typeorm-paginate";
import connectionAgenda from "../dataBase/data";
import Mensagens from "../entity/MensagensClientes";
import IMensagens from "../interfaces/IMensagens";

const mensagensEnviadas = connectionAgenda.getRepository(Mensagens);

const getMensagens = async (): Promise<IMensagens[]> => {
  const data = await mensagensEnviadas.find();
  return data;
};

const getMensagensPaginadas = async (
  page = 1,
  pageSize = 10,
  status?: "pendente" | "enviado" | "falhou" | "cancelado"
): Promise<Pagination<IMensagens>> => {
  const pageNum = page < 1 ? 1 : page;
  const sizeNum = pageSize < 1 ? 10 : pageSize;
  const qb = mensagensEnviadas
    .createQueryBuilder("mensagensEnviadas")
    .orderBy("mensagensEnviadas.agendaPara", "ASC");

  if (status) {
    qb.andWhere("mensagensEnviadas.status = :status", { status });
  }

  return paginate<IMensagens>(qb, { page: pageNum, limit: sizeNum });
};

const getMensagemById = async (id: number): Promise<any> => {
  const mensagens = await mensagensEnviadas.findOneBy({ id });
  if (!mensagens) {
    return { status: 404, message: "mensagem não existe" };
  }
  return mensagens;
};

const updateMensagem = async (id: number, mensagemAtualizar: IMensagens) => {
  try {
    console.log(mensagemAtualizar.agendaPara)
    const altMensagem = await mensagensEnviadas.update(id, {
      nome: mensagemAtualizar.nome,
      agendaPara: mensagemAtualizar.agendaPara,
      payload: mensagemAtualizar.payload,
      status: mensagemAtualizar.status,
      tentativas: mensagemAtualizar.tentativas,
      idTipoMensagem: mensagemAtualizar.idTipoMensagem,
    });
    return {
      status: 202,
      message: `${mensagemAtualizar.id} alterado com sucesso`,
    };
  } catch (error) {
    throw error;
  }
};

const deletaMensagem = async (id: number): Promise<any> => {
  try {
    const mensagem = await mensagensEnviadas.findOneBy({ id });
    if (!mensagem) {
      return { status: 404, message: "mensagem não existe" };
    }
    await mensagensEnviadas.delete(id);
    return { status: 200, message: "Mensagem deletada com sucesso" };
  } catch (error) {
    throw error;
  }
};

export { getMensagens, getMensagemById, getMensagensPaginadas, deletaMensagem, updateMensagem };
