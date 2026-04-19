import Prompt from "../entity/PromptIA";
interface IMensagens {
  id?: number;
  nome: string;
  agendaPara: Date;
  payload: {
    telefone: string;
    texto: string;
  };
  status?: "pendente" | "enviado" | "falhou" | "cancelado";
  tentativas?: number;
  idTipoMensagem: Prompt;
}

export default IMensagens;
