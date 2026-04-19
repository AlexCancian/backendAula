import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("logsEnvios")
class LogEnvio {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  idMensagem: string;

  @Column()
  status: "sucesso" | "falha";

  @Column("text", { nullable: true })
  erro: string;

  @CreateDateColumn()
  criadoEm: Date;
}

export default LogEnvio;
