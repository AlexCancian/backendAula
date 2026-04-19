import connectionAgenda from "../dataBase/data";
import Prompt from "../entity/PromptIA";
import IPrompt from "../interfaces/IPrompt";

const prompt = connectionAgenda.getRepository(Prompt);

const VARIAVEIS_PERMITIDAS = [
  "nome",
  "servico",
  "data",
  "hora",
  "valor",
];

const validarTemplate = (texto: string): string[] => {
  const regex = /{{(.*?)}}/g;
  const encontradas: string[] = [];
  let match;

  while ((match = regex.exec(texto)) !== null) {
    encontradas.push(match[1]);
  }

  const invalidas = encontradas.filter(
    (v) => !VARIAVEIS_PERMITIDAS.includes(v)
  );

  if (invalidas.length > 0) {
    throw new Error(`Variáveis inválidas: ${invalidas.join(", ")}`);
  }

  return encontradas;
};

const getPrompt = async (): Promise<IPrompt[]> => {
  const data = await prompt.find();
  return data;
};

const getPromptById = async (idTipoMensagem: number): Promise<any> => {
  const promptIA = await prompt.findOneBy({ idTipoMensagem });
  if (!promptIA) {
    return { status: 404, message: "id não existe" };
  }
  return promptIA;
};

const postPrompt = async (novoPrompt: IPrompt): Promise<any> => {
  try {
    validarTemplate(novoPrompt.prompt);

    const newPrompt = await prompt.create({
      tipo: novoPrompt.tipo,
      prompt: novoPrompt.prompt,
      unidade: novoPrompt.unidade,
      valor: novoPrompt.valor,
      associado: novoPrompt.associado,
      nomeCompleto: novoPrompt.nomeCompleto,
      status: novoPrompt.status,
    });
    await prompt.save(newPrompt);
    return newPrompt;
  } catch (error) {
    throw error;
  }
};

const updatePrompt = async (
  idTipoMensagem: number,
  promptIAAtualizar: IPrompt
) => {
  try {
    validarTemplate(promptIAAtualizar.prompt);

    const altPromptIA = await prompt.update(idTipoMensagem, {
      tipo: promptIAAtualizar.tipo,
      prompt: promptIAAtualizar.prompt,
      unidade: promptIAAtualizar.unidade,
      valor: promptIAAtualizar.valor,
      associado: promptIAAtualizar.associado,
      nomeCompleto: promptIAAtualizar.nomeCompleto,
      status: promptIAAtualizar.status,
    });
    return {
      status: 202,
      message: `Prompt ${promptIAAtualizar.tipo} alterado com sucesso`,
    };
  } catch (error) {
    throw error;
  }
};

const statusPromptIA = async (idTipoMensagem: number, status: boolean) => {
  try {
    const desativarPrompt = await prompt.update(idTipoMensagem, {
      status: status,
    });
    return "Prompt atualizado com sucesso";
  } catch (error) {
    throw error;
  }
};

const removePrompt = async (idTipoMensagem: number): Promise<any> => {
  try {
    const iaPrompt = await prompt.findOneBy({ idTipoMensagem });
    if (!iaPrompt) {
      return { status: 404, message: "id não existe" };
    }
    await prompt.delete(idTipoMensagem);
    return {
      status: 200,
      message: `Prompt ${iaPrompt.tipo} removido com sucesso`,
    };
  } catch (error) {
    throw error;
  }
};

export {
  getPrompt,
  getPromptById,
  postPrompt,
  updatePrompt,
  removePrompt,
  statusPromptIA,
};
