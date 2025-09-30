import { Injectable } from '@nestjs/common';
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case';
import { GetLeadsUseCase } from './application/use-cases/get-leads.use-case';
import { GetLeadByIdUseCase } from './application/use-cases/get-lead-by-id.use-case';
import { UpdateLeadUseCase } from './application/use-cases/update-lead.use-case';
import { UpdateLeadStatusUseCase } from './application/use-cases/update-lead-status.use-case';
import { Lead, LeadSource, LeadStatus } from './domain/entities/lead.entity';

// Define the DTOs that the controller expects
export interface CreateLeadBodyDto {
  clientId: number;
  ownerId: number;
  source?: LeadSource;
  notes?: string;
  estimatedValue?: number;
}

export interface UpdateLeadBodyDto {
  clientId?: number;
  ownerId?: number;
  source?: LeadSource;
  notes?: string;
  estimatedValue?: number;
  status?: LeadStatus;
}

export interface CreateLeadResponseDto {
  id: number;
  score: number;
}

export interface FindAllLeadsResponseDto {
  leads: Lead[];
}

export interface FilterLeadsQueryDto {
  userId?: number;
  status?: LeadStatus;
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly createLeadUseCase: CreateLeadUseCase,
    private readonly getLeadsUseCase: GetLeadsUseCase,
    private readonly getLeadByIdUseCase: GetLeadByIdUseCase,
    private readonly updateLeadUseCase: UpdateLeadUseCase,
    private readonly updateLeadStatusUseCase: UpdateLeadStatusUseCase,
  ) {}

  async create(
    createLeadDto: CreateLeadBodyDto,
  ): Promise<CreateLeadResponseDto> {
    const result = await this.createLeadUseCase.execute({
      clientId: createLeadDto.clientId,
      ownerId: createLeadDto.ownerId,
      source: createLeadDto.source,
      notes: createLeadDto.notes,
      estimatedValue: createLeadDto.estimatedValue,
    });

    return {
      id: result.id,
      score: result.score,
    };
  }

  async findAll(): Promise<FindAllLeadsResponseDto> {
    const result = await this.getLeadsUseCase.execute({});
    return { leads: result.leads };
  }

  async findByFilters(
    filters: FilterLeadsQueryDto,
  ): Promise<FindAllLeadsResponseDto> {
    const result = await this.getLeadsUseCase.execute({
      filters: {
        userId: filters.userId,
        status: filters.status,
      },
    });
    return { leads: result.leads };
  }

  async findById(id: number) {
    const result = await this.getLeadByIdUseCase.execute({ id });
    return result.lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadBodyDto) {
    // If status is being updated, use the status update use case
    if (updateLeadDto.status) {
      await this.updateLeadStatusUseCase.execute({
        leadId: id,
        newStatus: updateLeadDto.status,
      });
    }

    // Update other fields if any are provided
    const hasOtherUpdates =
      updateLeadDto.clientId !== undefined ||
      updateLeadDto.ownerId !== undefined ||
      updateLeadDto.source !== undefined ||
      updateLeadDto.notes !== undefined ||
      updateLeadDto.estimatedValue !== undefined;

    if (hasOtherUpdates) {
      return this.updateLeadUseCase.execute({
        id,
        clientId: updateLeadDto.clientId,
        ownerId: updateLeadDto.ownerId,
        source: updateLeadDto.source,
        notes: updateLeadDto.notes,
        estimatedValue: updateLeadDto.estimatedValue,
      });
    }

    // If only status was updated, return the updated lead
    const result = await this.getLeadByIdUseCase.execute({ id });
    return result.lead;
  }

  delete(id: number): Promise<void> {
    // Note: You'll need to implement a DeleteLeadUseCase for this method
    console.log(`Delete lead with id: ${id}`);
    throw new Error('Delete functionality not yet implemented');
  }
}
