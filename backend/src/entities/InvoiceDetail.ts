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
import { Invoice } from "./Invoice";
import { Client } from "./Client";
import { Employee } from "./Employee";

@Entity({ name: "invoice_details" })
export class InvoiceDetail {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "integer", nullable: false })
  @ForeignKey(() => Invoice)
  invoice_id: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.invoice_details)
  @JoinColumn({ name: "invoice_id" })
  invoice: Invoice;

  @Column({ type: "integer", nullable: false })
  @ForeignKey(() => Client)
  client_id: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "client_id" })
  client: Client;

  @Column({ type: "integer", nullable: false })
  @ForeignKey(() => Employee)
  employee_id: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @Column({ type: "date", nullable: false })
  date: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  billed_hours: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  billed_ot_hours: number;

  @Column({ type: "text", nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
