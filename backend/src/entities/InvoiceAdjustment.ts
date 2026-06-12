import {
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ForeignKey,
} from "typeorm";
import { Invoice } from "./Invoice";

@Entity({ name: "invoice_adjustments" })
export class InvoiceAdjustment {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({
    type: "varchar",
    length: 20,
    nullable: false,
    default: "ADDITIONAL",
  })
  type: "ADDITIONAL" | "DEDUCTION";

  @Column({ type: "integer", nullable: false })
  @ForeignKey(() => Invoice)
  invoice_id: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.invoice_adjustments)
  @JoinColumn({ name: "invoice_id" })
  invoice: Invoice;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  total: number;

  @Column({ type: "integer", nullable: false })
  sort: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
