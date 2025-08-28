import { Client } from 'src/clients/entities/client.entity';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id' })
  clientId: number;

  @Column({ name: 'issued_by' })
  issuedBy: number;

  @Column({ type: 'date', name: 'invoice_date' })
  invoiceDate: Date;

  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
  })
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    name: 'total_amount',
  })
  totalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'issued_by' })
  issuedByUser: User;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
  invoiceItems: InvoiceItem[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];
}
