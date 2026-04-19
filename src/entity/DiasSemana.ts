import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

@Entity("diasSemana")
class DiasSemana {
  @PrimaryGeneratedColumn("increment")
  idHorario: number;

  @Column("int")
  diaSemana: number;

  @Column("time", { nullable: true })
  horaInicio: string;

  @Column("time", { nullable: true })
  horaFim: string;

  @Column("int", { default: 30 })
  intervaloSlotMinutos: number;

  @Column("boolean", { default: false })
  ativo: boolean;
}

export default DiasSemana;
