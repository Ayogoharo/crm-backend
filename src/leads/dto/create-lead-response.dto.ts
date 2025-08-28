import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadResponseDto {
  @ApiProperty()
  id: number;
}
