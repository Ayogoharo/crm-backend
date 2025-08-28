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
    enum: ['new', 'contacted', 'qualified', 'won', 'lost'],
  })
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
}
