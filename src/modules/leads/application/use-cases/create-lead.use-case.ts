import { Injectable, Inject } from '@nestjs/common';
import {
  Lead,
  LeadSource,
  LeadStatus,
} from '../../domain/entities/lead.entity';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import { LeadScoringService } from '../../domain/services/lead-scoring.service';

export interface CreateLeadCommand {
  clientId: number;
  ownerId: number;
  source?: LeadSource;
  notes?: string;
  estimatedValue?: number;
}

export interface CreateLeadResult {
  id: number;
  score: number;
}

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async execute(command: CreateLeadCommand): Promise<CreateLeadResult> {
    // Create lead with default status
    const leadData: Partial<Lead> = {
      clientId: command.clientId,
      ownerId: command.ownerId,
      status: LeadStatus.NEW,
      source: command.source,
      notes: command.notes,
      estimatedValue: command.estimatedValue,
      score: 0, // Will be calculated after creation
    };

    const createdLead = await this.leadRepository.create(leadData);

    // Calculate and update score
    const score = this.leadScoringService.calculateScore(createdLead);
    await this.leadRepository.updateScore(createdLead.id, score);

    return {
      id: createdLead.id,
      score,
    };
  }
}
