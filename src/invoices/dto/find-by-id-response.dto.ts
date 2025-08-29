import { ApiProperty } from '@nestjs/swagger';

export class FindByIdResponseDto {
  @ApiProperty()
  id: number;
}
