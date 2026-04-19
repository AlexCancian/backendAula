import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import Prompt from "./PromptIA";

@Entity("mensagensEnviadas")
class Mensagens {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column("datetime")
  agendaPara: Date;

  @Column("varchar", { length: 100 })
  nome: string;

  @Column("json")
  payload: {
    telefone: string;
    texto: string;
  };

  @Column({ default: "pendente" })
  status: "pendente" | "enviado" | "falhou" | "cancelado";

  @Column({ default: 0 })
  tentativas: number;

  @ManyToOne(() => Prompt, (tipo) => tipo.mensagens)
  @JoinColumn({ name: "idTipoMensagem" })
  idTipoMensagem: Prompt;
}

export default Mensagens;
