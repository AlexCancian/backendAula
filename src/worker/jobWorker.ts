import cron from "node-cron";
import * as xlsx from "xlsx";
import connectionAgenda from "../dataBase/data";
import Job, { JobStatus } from "../entity/Job";
import { agendarMensagens } from "../utils/criarMensagem";
import { downloadFileFromS3 } from "../utils/s3Config";

let isJobProcessing = false;

export const processPendingJob = async () => {
  if (isJobProcessing) {
    console.log(`[Job Worker] processPendingJob ignorado: uma execução já está em curso.`);
    return;
  }

  isJobProcessing = true;

  try {
    console.log(`[Job Worker] processPendingJob disparado...`);
    if (!connectionAgenda.isInitialized) {
      console.log(`[Job Worker] Conexão com DB não inicializada.`);
      isJobProcessing = false;
      return;
    }

    let jobIdToProcess: number | null = null;

    // 1. Fase de Reserva: Marcamos o Job como PROCESSANDO o mais rápido possível em uma transação curta
    try {
      await connectionAgenda.transaction(async (transactionalEntityManager) => {
        const jobToReserve = await transactionalEntityManager
          .createQueryBuilder(Job, "job")
          .setLock("pessimistic_write")
          .where("job.status = :status", { status: JobStatus.PENDENTE })
          .orderBy("job.id", "ASC")
          .getOne();

        if (jobToReserve) {
          jobToReserve.status = JobStatus.PROCESSANDO;
          await transactionalEntityManager.save(jobToReserve);
          jobIdToProcess = jobToReserve.id;
        }
      });
    } catch (reserveErr) {
      console.error(`[Job Worker] Erro ao reservar job:`, reserveErr);
      isJobProcessing = false;
      return;
    }

    if (!jobIdToProcess) {
      console.log(`[Job Worker] Nenhum job PENDENTE encontrado.`);
      isJobProcessing = false;
      return;
    }

    console.log(`[Job Worker] Iniciando processamento do Job ID ${jobIdToProcess}...`);

    // 2. Fase de Processamento Pesado: Fora da transação de reserva para evitar locks longos no Worker
    const job = await connectionAgenda.getRepository(Job).findOne({
      where: { id: jobIdToProcess },
      relations: ["prompt"]
    });

    if (!job) {
      isJobProcessing = false;
      return;
    }

    try {
      // Fetch do buffer da planilha
      let excelBuffer;
      try {
        excelBuffer = await downloadFileFromS3(job.file_url);
      } catch (downloadErr) {
        console.error(`[Job Worker] Erro ao baixar o arquivo do Job ${job.id}:`, downloadErr);
        await connectionAgenda.getRepository(Job).update(job.id, { status: JobStatus.ERRO });
        isJobProcessing = false;
        return;
      }

      // Extrair a planilha
      const workbook = xlsx.read(excelBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

      if (data && data.length > 0) {
        console.log(`[Job Worker] Encontrado total de ${data.length} contatos para job ${job.id}.`);
        
        // Agendar mensagens (dentro de transação própria para garantir integridade dos agendamentos)
        await connectionAgenda.transaction(async (manager) => {
           await agendarMensagens(manager, job, data);
           await manager.update(Job, job.id, { status: JobStatus.FINALIZADO });
        });
        
        console.log(`[Job Worker] Job ${job.id} concluído com sucesso.`);
      } else {
        console.log(`[Job Worker] Job ${job.id} sem dados na planilha.`);
        await connectionAgenda.getRepository(Job).update(job.id, { status: JobStatus.FINALIZADO });
      }

    } catch (processingErr) {
      console.error(`[Job Worker] Erro ao processar/agendar job ${job.id}:`, processingErr);
      await connectionAgenda.getRepository(Job).update(job.id, { status: JobStatus.ERRO });
    } finally {
      isJobProcessing = false;
    }

  } catch (e) {
    console.error(`[Job Worker] Erro fatal no worker:`, e);
    isJobProcessing = false;
  }
};

export const startJobWorker = () => {
  cron.schedule("* * * * *", async () => {
    await processPendingJob();
  });

  console.log("Job worker registrado via node-cron e escutando...");
};
