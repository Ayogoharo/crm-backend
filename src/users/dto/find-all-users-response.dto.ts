import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: ['admin', 'sales', 'accountant'] })
  role: 'admin' | 'sales' | 'accountant';

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FindAllUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];
}
