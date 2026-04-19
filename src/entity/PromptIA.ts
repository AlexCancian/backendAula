import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import Mensagens from "./MensagensClientes";

@Entity("promptIA")
class Prompt {
  @PrimaryGeneratedColumn("increment")
  idTipoMensagem: number;

  @Column("varchar", { length: 150 })
  tipo: string;

  @Column("text")
  prompt: string;

  @Column("varchar", { length: 50 }) // valores como "days", "minutes"
  unidade: string;

  @Column("int") // valor como 1, 30 etc
  valor: number;

  @Column("boolean", { default: true })
  associado: boolean;

  @Column("boolean", { default: false })
  nomeCompleto: boolean;

  @Column("boolean", { default: true })
  status: boolean;

  @OneToMany(() => Mensagens, (mensagem) => mensagem.idTipoMensagem)
  mensagens: Mensagens[];
}

export default Prompt;
