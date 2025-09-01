import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './domain/entities/lead.entity';
import { LeadsController } from './leads.controller';
import { CreateLeadUseCase } from './application/use-cases/create-lead.use-case';
import { GetLeadsUseCase } from './application/use-cases/get-leads.use-case';
import { GetLeadByIdUseCase } from './application/use-cases/get-lead-by-id.use-case';
import { UpdateLeadUseCase } from './application/use-cases/update-lead.use-case';
import { UpdateLeadStatusUseCase } from './application/use-cases/update-lead-status.use-case';
import { LeadScoringService } from './domain/services/lead-scoring.service';
import { TypeOrmLeadRepository } from './infrastructure/repositories/typeorm-lead.repository';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead])],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    CreateLeadUseCase,
    GetLeadsUseCase,
    GetLeadByIdUseCase,
    UpdateLeadUseCase,
    UpdateLeadStatusUseCase,
    LeadScoringService,
    {
      provide: 'ILeadRepository',
      useClass: TypeOrmLeadRepository,
    },
  ],
  exports: [LeadsService],
})
export class LeadsModule {}
