import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "clients" })
export class Client {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "varchar", length: 150, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 150, nullable: false })
  owner: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  address1: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address2: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  hourly_rate: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  ot_hourly_rate: number;

  @Column({
    type: "varchar",
    length: 20,
    nullable: false,
    default: "active",
  })
  status: "active" | "inactive";

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
