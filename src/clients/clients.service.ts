import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateClientResponseDto } from './dto/create-client-response.dto';
import {
  FindAllClientsResponseDto,
  ClientResponseDto,
} from './dto/find-all-clients-response.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateClientResponseDto } from './dto/update-client-response.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(clientData: CreateClientDto): Promise<CreateClientResponseDto> {
    const client = this.clientRepository.create(clientData);
    const newClient = await this.clientRepository.save(client);
    return { id: newClient.id };
  }

  async findAll(): Promise<FindAllClientsResponseDto> {
    try {
      const clients = await this.clientRepository.find();
      const clientDtos: ClientResponseDto[] = clients.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      }));
      return { clients: clientDtos };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding clients: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: number): Promise<Client> {
    try {
      const client = await this.clientRepository.findOneBy({ id });
      if (!client || client === null) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      return client;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error finding client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(id: number, clientData: UpdateClientDto): Promise<UpdateClientResponseDto> {
    await this.findById(id);
    await this.clientRepository.update(id, clientData);
    const updatedClient = await this.findById(id);
    return {
      id: updatedClient.id,
      name: updatedClient.name,
      email: updatedClient.email,
      phone: updatedClient.phone,
      address: updatedClient.address,
      createdAt: updatedClient.createdAt,
      updatedAt: updatedClient.updatedAt,
    };
  }

  async delete(id: number): Promise<void> {
    const client = await this.findById(id); // Check if client exists
    await this.clientRepository.remove(client);
  }
}
