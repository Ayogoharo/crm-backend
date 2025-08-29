import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLeadBodyDto } from './dto/create-lead-body.dto';
import { CreateLeadResponseDto } from './dto/create-lead-response.dto';
import { FindAllLeadsResponseDto } from './dto/find-all-leads-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateLeadResponseDto } from './dto/update-lead-response.dto';
import { UpdateLeadBodyDto } from './dto/update-lead-body.dto';
import { FilterLeadsQueryDto } from './dto/filter-leads-query.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(leadData: CreateLeadBodyDto): Promise<CreateLeadResponseDto> {
    try {
      const lead = this.leadRepository.create(leadData);
      const newLead = await this.leadRepository.save(lead);
      return { id: newLead.id };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<FindAllLeadsResponseDto> {
    try {
      const leads = await this.leadRepository.find({
        relations: ['client', 'owner'],
      });
      return { leads };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding leads: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<FindByIdResponseDto> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { id },
        relations: ['client', 'owner'],
      });
      if (!lead || lead === null) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }
      return lead;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(
    id: number,
    lead: UpdateLeadBodyDto,
  ): Promise<UpdateLeadResponseDto> {
    try {
      const existingLead = await this.leadRepository.findOneBy({ id: lead.id });
      if (!existingLead || existingLead === null) {
        throw new NotFoundException(`Lead with ID ${lead.id} not found`);
      }
      await this.leadRepository.update(lead.id, lead);
      return this.findById(lead.id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingLead = await this.leadRepository.findOneBy({ id });
      if (!existingLead || existingLead === null) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }
      await this.leadRepository.remove(existingLead);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findByFilters(
    filters: FilterLeadsQueryDto,
  ): Promise<FindAllLeadsResponseDto> {
    try {
      const queryBuilder = this.leadRepository
        .createQueryBuilder('lead')
        .leftJoinAndSelect('lead.client', 'client')
        .leftJoinAndSelect('lead.owner', 'owner');

      if (filters.userId) {
        queryBuilder.andWhere('lead.ownerId = :ownerId', {
          ownerId: parseInt(filters.userId),
        });
      }

      if (filters.status) {
        const statusArray = Array.isArray(filters.status)
          ? filters.status
          : [filters.status];

        // Map semantic status values to actual database values
        const mappedStatuses: string[] = [];
        statusArray.forEach((status) => {
          if (status === 'open') {
            mappedStatuses.push('new', 'contacted', 'qualified');
          } else if (status === 'closed') {
            mappedStatuses.push('won', 'lost');
          } else {
            // Direct status values (new, contacted, qualified, won, lost)
            mappedStatuses.push(status);
          }
        });
        queryBuilder.andWhere('lead.status IN (:...statuses)', {
          statuses: mappedStatuses,
        });
      }

      const leads = await queryBuilder.getMany();
      return { leads };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding leads with filters: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
