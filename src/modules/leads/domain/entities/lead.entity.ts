import { Client } from 'src/clients/entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  WON = 'won',
  LOST = 'lost',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  COLD_CALL = 'cold_call',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  TRADE_SHOW = 'trade_show',
  OTHER = 'other',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id' })
  clientId: number;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({
    type: 'varchar',
    length: 50,
    enum: Object.values(LeadStatus),
  })
  status: LeadStatus;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    enum: Object.values(LeadSource),
  })
  source: LeadSource;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedValue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.leads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // Business logic methods
  canTransitionTo(newStatus: LeadStatus): boolean {
    const validTransitions: Record<LeadStatus, LeadStatus[]> = {
      [LeadStatus.NEW]: [LeadStatus.CONTACTED, LeadStatus.LOST],
      [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.LOST],
      [LeadStatus.QUALIFIED]: [LeadStatus.WON, LeadStatus.LOST],
      [LeadStatus.WON]: [], // Terminal state
      [LeadStatus.LOST]: [LeadStatus.NEW], // Can be reopened
    };

    return validTransitions[this.status].includes(newStatus);
  }

  updateStatus(newStatus: LeadStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;
  }

  isOpen(): boolean {
    return [
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.QUALIFIED,
    ].includes(this.status);
  }

  isClosed(): boolean {
    return [LeadStatus.WON, LeadStatus.LOST].includes(this.status);
  }

  isWon(): boolean {
    return this.status === LeadStatus.WON;
  }

  getDaysInCurrentStatus(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.updatedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  addNote(note: string): void {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${note}`;
    this.notes = this.notes ? `${this.notes}\n${newNote}` : newNote;
  }
}
