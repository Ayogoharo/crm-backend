import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'invoice_id' })
  invoiceId: number;

  @Column({ name: 'recorded_by', nullable: true })
  recordedBy: number;

  @Column({ type: 'date', name: 'payment_date' })
  paymentDate: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['cash', 'bank_transfer', 'credit_card', 'paypal'],
  })
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'paypal';

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by' })
  recordedByUser: User;
}
