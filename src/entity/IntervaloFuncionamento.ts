import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity("intervaloFuncionamento")
class IntervaloFuncionamento {
    @PrimaryGeneratedColumn("increment")
    idIntervalo: number;

    @Column("int")
    diaSemana: number;

    @Column("time")
    horaInicio: string;

    @Column("time")
    horaFim: string;

    @Column("varchar", { length: 255 })
    descricao: string;

    @Column("boolean")
    status: boolean;
}

export default IntervaloFuncionamento;
