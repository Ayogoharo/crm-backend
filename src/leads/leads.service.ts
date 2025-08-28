import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(leadData: Partial<Lead>): Promise<Lead> {
    const lead = this.leadRepository.create(leadData);
    return this.leadRepository.save(lead);
  }

  async findAll(): Promise<Lead[]> {
    try {
      return this.leadRepository.find({
        relations: ['client', 'owner'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding leads: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<Lead> {
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

  async update(id: number, leadData: Partial<Lead>): Promise<Lead> {
    await this.findById(id); // Check if lead exists
    await this.leadRepository.update(id, leadData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const lead = await this.findById(id); // Check if lead exists
    await this.leadRepository.remove(lead);
  }
}
