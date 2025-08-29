import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserBodyDto } from './dto/create-userbody.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { FindAllUsersResponseDto } from './dto/find-all-users-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateUserBodyDto } from './dto/update-user-body.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserBodyDto,
  ): Promise<CreateUserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<FindAllUsersResponseDto> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindByIdResponseDto> {
    return this.usersService.findById(id);
  }

  @Put()
  async update(
    @Body() updateUserDto: UpdateUserBodyDto,
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.delete(id);
  }
}
