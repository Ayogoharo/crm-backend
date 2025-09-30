import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserBodyDto } from './dto/create-user-body.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { FindAllUsersResponseDto } from './dto/find-all-users-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateUserBodyDto } from './dto/update-user-body.dto';
import { PatchUserBodyDto } from './dto/patch-user-body.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  async create(
    @Body() createUserDto: CreateUserBodyDto,
  ): Promise<CreateUserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin', 'sales')
  async findAll(): Promise<FindAllUsersResponseDto> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindByIdResponseDto> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserBodyDto,
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchUserDto: PatchUserBodyDto,
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.patch(id, patchUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.delete(id);
  }
}
