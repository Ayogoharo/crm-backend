import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserBodyDto } from './dto/create-userbody.dto';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { FindAllUsersResponseDto } from './dto/find-all-users-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';
import { UpdateUserBodyDto } from './dto/update-user-body.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(userData: CreateUserBodyDto): Promise<CreateUserResponseDto> {
    try {
      const user = this.userRepository.create(userData);
      const newUser = await this.userRepository.save(user);
      return { id: newUser.id };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<FindAllUsersResponseDto> {
    try {
      const users = await this.userRepository.find();
      return { users };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<FindByIdResponseDto> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user || user === null) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(user: UpdateUserBodyDto): Promise<UpdateUserResponseDto> {
    try {
      const existingUser = await this.userRepository.findOneBy({ id: user.id });
      if (!existingUser || existingUser === null) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
      }
      await this.userRepository.update(user.id, user);
      return this.findById(user.id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingUser = await this.userRepository.findOneBy({ id });
      if (!existingUser || existingUser === null) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await this.userRepository.remove(existingUser);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
