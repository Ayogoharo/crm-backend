import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../domain/entities/lead.entity';
import {
  ILeadRepository,
  LeadFilters,
} from '../../domain/repositories/lead.repository.interface';

@Injectable()
export class TypeOrmLeadRepository implements ILeadRepository {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(leadData: Partial<Lead>): Promise<Lead> {
    try {
      const lead = this.leadRepository.create(leadData);
      return await this.leadRepository.save(lead);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<Lead | null> {
    try {
      const lead = await this.leadRepository.findOne({
        where: { id },
        relations: ['client', 'owner'],
      });
      return lead;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<Lead[]> {
    try {
      return await this.leadRepository.find({
        relations: ['client', 'owner'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding leads: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findByFilters(filters: LeadFilters): Promise<Lead[]> {
    try {
      const queryBuilder = this.leadRepository
        .createQueryBuilder('lead')
        .leftJoinAndSelect('lead.client', 'client')
        .leftJoinAndSelect('lead.owner', 'owner');

      if (filters.userId) {
        queryBuilder.andWhere('lead.ownerId = :ownerId', {
          ownerId: filters.userId,
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
            mappedStatuses.push(status);
          }
        });
        queryBuilder.andWhere('lead.status IN (:...statuses)', {
          statuses: mappedStatuses,
        });
      }

      if (filters.source) {
        queryBuilder.andWhere('lead.source = :source', {
          source: filters.source,
        });
      }

      if (filters.minScore !== undefined) {
        queryBuilder.andWhere('lead.score >= :minScore', {
          minScore: filters.minScore,
        });
      }

      if (filters.maxScore !== undefined) {
        queryBuilder.andWhere('lead.score <= :maxScore', {
          maxScore: filters.maxScore,
        });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding leads with filters: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(id: number, leadData: Partial<Lead>): Promise<Lead> {
    try {
      const existingLead = await this.findById(id);
      if (!existingLead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }

      await this.leadRepository.update(id, leadData);
      const updatedLead = await this.findById(id);
      if (!updatedLead) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated lead',
        );
      }
      return updatedLead;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error updating lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingLead = await this.leadRepository.findOneBy({ id });
      if (!existingLead) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }
      await this.leadRepository.remove(existingLead);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error deleting lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findByOwnerId(ownerId: number): Promise<Lead[]> {
    try {
      return await this.leadRepository.find({
        where: { ownerId },
        relations: ['client', 'owner'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding leads by owner: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findStaleLeads(days: number): Promise<Lead[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return await this.leadRepository
        .createQueryBuilder('lead')
        .leftJoinAndSelect('lead.client', 'client')
        .leftJoinAndSelect('lead.owner', 'owner')
        .where('lead.updatedAt < :cutoffDate', { cutoffDate })
        .andWhere('lead.status IN (:...statuses)', {
          statuses: ['new', 'contacted', 'qualified'],
        })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding stale leads: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateScore(id: number, score: number): Promise<void> {
    try {
      await this.leadRepository.update(id, { score });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating lead score: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
