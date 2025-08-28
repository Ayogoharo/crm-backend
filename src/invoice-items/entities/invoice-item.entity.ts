import { Invoice } from 'src/invoices/entities/invoice.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'invoice_id' })
  invoiceId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'unit_price',
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'line_total',
  })
  lineTotal: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.invoiceItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
