import { ApiProperty } from '@nestjs/swagger';
import { Lead } from '../entities/lead.entity';

export class UpdateLeadResponseDto extends Lead {
  @ApiProperty()
  declare id: number;
}
