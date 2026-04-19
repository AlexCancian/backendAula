import { add } from "date-fns";
import { EntityManager } from "typeorm";
import Mensagens from "../entity/MensagensClientes";
import DiasSemana from "../entity/DiasSemana";
import IntervaloFuncionamento from "../entity/IntervaloFuncionamento";
import Job from "../entity/Job";

const toMinutes = (t: string) => {
  if (!t) return 0;
  const parts = t.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

export const getProximaHoraValida = (
  agora: Date,
  diasSemana: DiasSemana[],
  intervalos: IntervaloFuncionamento[]
): Date => {
  let iterDate = new Date(agora);

  // Tentamos encontrar o horário válido percorrendo os próximos dias (máx 30)
  for (let i = 0; i < 30 * 24 * 60; i++) {
    // Como o usuário já faz o ajuste manual de -3h no agendarMensagens,
    // as funções UTC do JS agora refletem o "Tempo de Brasília" pretendido.
    // Isso evita o erro de "duplo fuso" que estava ocorrendo.
    const dayOfWeek = iterDate.getUTCDay();
    const currentMinutes = iterDate.getUTCHours() * 60 + iterDate.getUTCMinutes();

    // 1. Verificar se o dia da semana está ativo
    const diaConfig = diasSemana.find(d => d.diaSemana === dayOfWeek && d.ativo);

    if (!diaConfig || !diaConfig.horaInicio || !diaConfig.horaFim) {
      // Dia inativo ou sem horário: pula para o início do próximo dia
      iterDate.setUTCHours(0, 0, 0, 0);
      iterDate = add(iterDate, { days: 1 });
      continue;
    }

    const startMinutes = toMinutes(diaConfig.horaInicio);
    const endMinutes = toMinutes(diaConfig.horaFim);

    // 2. Se for ANTES do início do expediente, adianta para o início
    if (currentMinutes < startMinutes) {
      const h = Math.floor(startMinutes / 60);
      const m = startMinutes % 60;
      iterDate.setUTCHours(h, m, 0, 0);
      continue;
    }

    // 3. Se for DEPOIS do fim do expediente, pula para o próximo dia
    if (currentMinutes >= endMinutes) {
      iterDate.setUTCHours(0, 0, 0, 0);
      iterDate = add(iterDate, { days: 1 });
      continue;
    }

    // 4. Verificar intervalos (pausas)
    const taNoIntervalo = intervalos.some(intervalo => {
      if (intervalo.diaSemana !== dayOfWeek || !intervalo.status) return false;
      const intStart = toMinutes(intervalo.horaInicio);
      const intEnd = toMinutes(intervalo.horaFim);
      return currentMinutes >= intStart && currentMinutes < intEnd;
    });

    if (taNoIntervalo) {
      iterDate = add(iterDate, { minutes: 1 });
      continue;
    }

    // Se passou por todas as regras, o horário atual é válido
    return iterDate;
  }

  return iterDate;
};

export const agendarMensagens = async (
  manager: EntityManager,
  job: Job,
  planilhaDados: any[]
) => {
  const prompt = job.prompt;
  if (!prompt || !prompt.status) return;

  const diasSemana = await manager.find(DiasSemana, { where: { ativo: true } });
  const intervalos = await manager.find(IntervaloFuncionamento, { where: { status: true } });

  const mensagens: Mensagens[] = [];

  // Começa do tempo atual
  let dataAgendamento = new Date();
  dataAgendamento.setHours(dataAgendamento.getHours() - 3); // Ajuste UTC-3 caso necessario

  for (const row of planilhaDados) {
    if (!row) continue;

    // Acha a proxima data valida a partir de dataAgendamento respectiva aos dias de funcionamento
    dataAgendamento = getProximaHoraValida(dataAgendamento, diasSemana, intervalos);

    // Formatação seguindo o padrão de timezone manual do projeto (UTC exibe o valor já deslocado)
    const dataFormatada = dataAgendamento.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    const horaFormatada = dataAgendamento.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

    const nomeOriginal = row.nome || row.Nome || row.NOME || "";
    // Se prompt.nomeCompleto for true, usa o nome completo vindo do excel, senão pega apenas o primeiro nome
    const nomeParaMensagem = prompt.nomeCompleto ? nomeOriginal : nomeOriginal.split(" ")[0];

    const telefone = String(row.celular || row.Celular || row.telefone || row.Telefone || "");
    const valorOriginal = Number(row.valor || row.Valor || 0);

    const valorFormatado = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valorOriginal);

    let texto = prompt.prompt
      .replace(/{{nome}}/g, nomeParaMensagem)
      .replace(/{{valor}}/g, valorFormatado);

    if (telefone) {
      const mensagem = manager.create(Mensagens, {
        idTipoMensagem: prompt,
        nome: nomeParaMensagem,
        agendaPara: new Date(dataAgendamento), // Copia o valor
        payload: {
          telefone,
          texto,
        },
      });

      mensagens.push(mensagem);

      // Incrementa o tempo para a próxima mensagem conform o Prompt
      const valorPrompt = prompt.valor || 1;
      const unidadePrompt: any = prompt.unidade || "minutes";

      dataAgendamento = add(dataAgendamento, { [unidadePrompt]: valorPrompt });
    }
  }

  await manager.save(mensagens, { chunk: 500 });
};

export default agendarMensagens;
