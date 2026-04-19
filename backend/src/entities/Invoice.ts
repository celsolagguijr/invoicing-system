import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ForeignKey,
  OneToMany,
} from "typeorm";
import { Client } from "./Client";
import { InvoiceDetail } from "./InvoiceDetail";

@Entity({ name: "invoices" })
export class Invoice {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "varchar", length: 100, nullable: false, unique: true })
  invoice_no: string;

  @Column({ type: "integer", nullable: false })
  @ForeignKey(() => Client)
  client_id: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "client_id" })
  client: Client;

  @Column({ type: "datetime", nullable: false })
  invoice_date: Date;

  @Column({ type: "datetime", nullable: false })
  due_date: Date;

  @Column({ type: "datetime", nullable: false })
  coverage_start: Date;

  @Column({ type: "datetime", nullable: false })
  coverage_end: Date;

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

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  total_working_hours: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  total_amount: number;

  @OneToMany(() => InvoiceDetail, (detail) => detail.invoice, {
    cascade: true,
  })
  invoice_details: InvoiceDetail[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
