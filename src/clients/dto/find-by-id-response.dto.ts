import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../entities/client.entity';

export class FindByIdResponseDto extends Client {
  @ApiProperty()
  declare id: number;
}
