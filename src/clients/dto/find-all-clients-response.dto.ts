import { ApiProperty } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FindAllClientsResponseDto {
  @ApiProperty({ type: [ClientResponseDto] })
  clients: ClientResponseDto[];
}
