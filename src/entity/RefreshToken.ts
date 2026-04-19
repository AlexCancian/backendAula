import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import User from "./User";

@Entity("user_refresh_token")
class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("int")
  expiresIn: number;

  @ManyToOne(() => User, (user) => user.refreshUsuario)
  @JoinColumn({ name: "idUsuario" })
  idUsuario: User;

  @CreateDateColumn()
  createdAt: Date;
}

export default RefreshToken;
