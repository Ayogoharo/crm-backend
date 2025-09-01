import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Lead } from '../../domain/entities/lead.entity';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.interface';

export interface GetLeadByIdQuery {
  id: number;
}

export interface GetLeadByIdResult {
  lead: Lead;
}

@Injectable()
export class GetLeadByIdUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(query: GetLeadByIdQuery): Promise<GetLeadByIdResult> {
    const lead = await this.leadRepository.findById(query.id);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${query.id} not found`);
    }

    return { lead };
  }
}
