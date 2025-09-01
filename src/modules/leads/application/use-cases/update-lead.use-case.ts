import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Lead, LeadSource } from '../../domain/entities/lead.entity';
import { LeadScoringService } from '../../domain/services/lead-scoring.service';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';

export interface UpdateLeadCommand {
  id: number;
  clientId?: number;
  ownerId?: number;
  source?: LeadSource;
  notes?: string;
  estimatedValue?: number;
}

export interface UpdateLeadResult {
  lead: Lead;
  newScore: number;
}

@Injectable()
export class UpdateLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async execute(command: UpdateLeadCommand): Promise<UpdateLeadResult> {
    const existingLead = await this.leadRepository.findById(command.id);
    if (!existingLead) {
      throw new NotFoundException(`Lead with ID ${command.id} not found`);
    }

    // Prepare update data
    const updateData: Partial<Lead> = {};
    if (command.clientId !== undefined) updateData.clientId = command.clientId;
    if (command.ownerId !== undefined) updateData.ownerId = command.ownerId;
    if (command.source !== undefined) updateData.source = command.source;
    if (command.estimatedValue !== undefined)
      updateData.estimatedValue = command.estimatedValue;

    // Handle notes - append if provided
    if (command.notes) {
      existingLead.addNote(command.notes);
      updateData.notes = existingLead.notes;
    }

    const updatedLead = await this.leadRepository.update(
      command.id,
      updateData,
    );

    // Recalculate score
    const newScore = this.leadScoringService.calculateScore(updatedLead);
    await this.leadRepository.updateScore(updatedLead.id, newScore);

    return {
      lead: updatedLead,
      newScore,
    };
  }
}
