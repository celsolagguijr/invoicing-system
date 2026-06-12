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
import { InvoiceAdjustment } from "./InvoiceAdjustment";

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

  @Column({ type: "date", nullable: false })
  invoice_date: Date;

  @Column({ type: "date", nullable: false })
  due_date: Date;

  @Column({ type: "date", nullable: false })
  coverage_start: Date;

  @Column({ type: "date", nullable: false })
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

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  total_ot_working_hours: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  total_amount: number;

  @OneToMany(() => InvoiceDetail, (detail) => detail.invoice, {
    cascade: true,
  })
  invoice_details: InvoiceDetail[];

  @OneToMany(() => InvoiceAdjustment, (adjustment) => adjustment.invoice, {
    cascade: true,
  })
  invoice_adjustments: InvoiceAdjustment[];

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  total_additions: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  total_deductions: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  grand_total: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
