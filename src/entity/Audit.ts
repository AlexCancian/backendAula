import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("audit")
class Audit {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("varchar", { length: 255 })
    descricao: string;

    @Column("varchar", { length: 100, nullable: true })
    entidade: string;

    @Column("int", { nullable: true })
    entityId: number;

    @Column("text", { nullable: true })
    dados: string;

    @CreateDateColumn()
    criadoEm: Date;
}

export default Audit;
