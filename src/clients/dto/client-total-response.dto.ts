import { ApiProperty } from '@nestjs/swagger';

export class ClientTotalResponseDto {
  @ApiProperty()
  clientId: number;

  @ApiProperty()
  total: number;
}
