import { Lead } from '../entities/lead.entity';

export interface LeadFilters {
  userId?: number;
  status?: string | string[];
  source?: string;
  minScore?: number;
  maxScore?: number;
}

export interface ILeadRepository {
  create(lead: Partial<Lead>): Promise<Lead>;
  findById(id: number): Promise<Lead | null>;
  findAll(): Promise<Lead[]>;
  findByFilters(filters: LeadFilters): Promise<Lead[]>;
  update(id: number, lead: Partial<Lead>): Promise<Lead>;
  delete(id: number): Promise<void>;
  findByOwnerId(ownerId: number): Promise<Lead[]>;
  findStaleLeads(days: number): Promise<Lead[]>;
  updateScore(id: number, score: number): Promise<void>;
}
