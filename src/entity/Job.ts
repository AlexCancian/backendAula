import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import Prompt from "./PromptIA";

export enum JobStatus {
  PENDENTE = "PENDENTE",
  PROCESSANDO = "PROCESSANDO",
  FINALIZADO = "FINALIZADO",
  ERRO = "ERRO"
}

@Entity("job")
class Job {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("varchar", { length: 500 })
  file_url: string;

  @Column("enum", { enum: JobStatus, default: JobStatus.PENDENTE })
  status: JobStatus;

  @Column("int")
  idTipoMensagem: number;

  @ManyToOne(() => Prompt)
  @JoinColumn({ name: "idTipoMensagem", referencedColumnName: "idTipoMensagem" })
  prompt: Prompt;

  @CreateDateColumn()
  created_at: Date;
}

export default Job;
