import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "employees" })
export class Employee {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "varchar", length: 100 })
  employee_no: string;

  @Column({ type: "varchar", length: 255 })
  employee_name: string;

  @Column({ type: "date" })
  date_of_birth: Date;

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
