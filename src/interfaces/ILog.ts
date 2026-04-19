interface ILog {
  id?: string;
  idMensagem: string;
  status: "sucesso" | "falha";
  erro: string;
  criadoEm: Date;
}

export default ILog;
