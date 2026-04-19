import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import bcrypt from "bcrypt";
import RefreshToken from "./RefreshToken";

@Entity("usuario")
class User {
  @PrimaryGeneratedColumn("increment")
  idUsuario: number;

  @Column("varchar", { length: 255 })
  nome: string;

  @Column("varchar", { length: 100 })
  apelido: string;

  @Column("char", { length: 11, nullable: true })
  cpf: string;

  @Column("boolean", { default: true })
  status: boolean;

  @Column("varchar", { length: 200, nullable: true })
  email: string;

  @Column("varchar", { length: 255, select: false, nullable: true })
  senha: string;

  @Column("varchar", { length: 6, nullable: true })
  codigoRecuperacao: string;

  @BeforeInsert()
  @BeforeUpdate()
  hashSenha() {
    if (this.senha) {
      this.senha = bcrypt.hashSync(this.senha, 8);
    }
  }

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.idUsuario)
  refreshUsuario: RefreshToken[];
}

export default User;
