import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Lead, LeadStatus } from '../../domain/entities/lead.entity';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';
import { LeadScoringService } from '../../domain/services/lead-scoring.service';

export interface UpdateLeadStatusCommand {
  leadId: number;
  newStatus: LeadStatus;
  notes?: string;
}

export interface UpdateLeadStatusResult {
  lead: Lead;
  newScore: number;
}

@Injectable()
export class UpdateLeadStatusUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async execute(
    command: UpdateLeadStatusCommand,
  ): Promise<UpdateLeadStatusResult> {
    const lead = await this.leadRepository.findById(command.leadId);
    if (!lead) {
      throw new BadRequestException(`Lead with ID ${command.leadId} not found`);
    }

    // Use domain logic to validate status transition
    if (!lead.canTransitionTo(command.newStatus)) {
      throw new BadRequestException(
        `Cannot transition lead from ${lead.status} to ${command.newStatus}`,
      );
    }

    // Update status using domain method
    lead.updateStatus(command.newStatus);

    // Add notes if provided
    if (command.notes) {
      lead.addNote(command.notes);
    }

    // Update the lead
    const updatedLead = await this.leadRepository.update(lead.id, {
      status: lead.status,
      notes: lead.notes,
    });

    // Recalculate score
    const newScore = this.leadScoringService.calculateScore(updatedLead);
    await this.leadRepository.updateScore(updatedLead.id, newScore);

    return {
      lead: updatedLead,
      newScore,
    };
  }
}
