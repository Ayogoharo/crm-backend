import { Injectable, Inject } from '@nestjs/common';
import { Lead } from '../../domain/entities/lead.entity';
import type {
  ILeadRepository,
  LeadFilters,
} from '../../domain/repositories/lead.repository.interface';

export interface GetLeadsQuery {
  filters?: LeadFilters;
}

export interface GetLeadsResult {
  leads: Lead[];
}

@Injectable()
export class GetLeadsUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(query: GetLeadsQuery = {}): Promise<GetLeadsResult> {
    let leads: Lead[];

    if (query.filters && Object.keys(query.filters).length > 0) {
      leads = await this.leadRepository.findByFilters(query.filters);
    } else {
      leads = await this.leadRepository.findAll();
    }

    return { leads };
  }
}
