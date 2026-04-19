import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ForeignKey,
} from "typeorm";
import { Employee } from "./Employee";
import { Client } from "./Client";

@Entity({ name: "employee_customer_transactions" })
export class EmployeeCustomerTransaction {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "integer", nullable: false })
  @ForeignKey(() => Employee)
  employee_id: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @Column({ type: "integer", nullable: false })
  @ForeignKey(() => Client)
  customer_id: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "customer_id" })
  customer: Client;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  working_hours: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  ot_working_hours: number;

  @Column({ type: "date", nullable: false })
  date: Date;

  @Column({ type: "text", nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
