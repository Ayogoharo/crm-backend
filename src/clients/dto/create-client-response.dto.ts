import { ApiProperty } from '@nestjs/swagger';

export class CreateClientResponseDto {
  @ApiProperty()
  id: number;
}
