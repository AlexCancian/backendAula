import Job, { JobStatus } from "../entity/Job";
import connectionAgenda from "../dataBase/data";

const jobRepository = connectionAgenda.getRepository(Job);

export const createJob = async (file_url: string, idTipoMensagem: number): Promise<Job> => {
  const newJob = jobRepository.create({
    file_url,
    status: JobStatus.PENDENTE,
    idTipoMensagem
  });
  await jobRepository.save(newJob);
  return newJob;
};

export const getJobs = async (): Promise<Job[]> => {
  return await jobRepository.find({ relations: ["prompt"] });
};

export const updateJobStatus = async (id: number, status: JobStatus): Promise<Job | null> => {
  const job = await jobRepository.findOne({ where: { id } });
  if (job) {
    job.status = status;
    await jobRepository.save(job);
    return job;
  }
  return null;
};
