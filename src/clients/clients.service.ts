import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateClientBodyDto } from './dto/create-client-body.dto';
import { CreateClientResponseDto } from './dto/create-client-response.dto';
import {
  FindAllClientsResponseDto,
  ClientResponseDto,
} from './dto/find-all-clients-response.dto';
import { UpdateClientResponseDto } from './dto/update-client-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateClientBodyDto } from './dto/update-client-body.dto';
import { PatchClientBodyDto } from './dto/patch-client-body.dto';
import { ClientTotalResponseDto } from './dto/client-total-response.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(
    clientData: CreateClientBodyDto,
  ): Promise<CreateClientResponseDto> {
    try {
      const client = this.clientRepository.create(clientData);
      const newClient = await this.clientRepository.save(client);
      return { id: newClient.id };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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

  async findById(id: number): Promise<FindByIdResponseDto> {
    try {
      const client = await this.clientRepository.findOneBy({ id });
      if (!client || client === null) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      return client;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error finding client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(
    id: number,
    client: UpdateClientBodyDto,
  ): Promise<UpdateClientResponseDto> {
    try {
      const existingClient = await this.clientRepository.findOneBy({ id });
      if (!existingClient || existingClient === null) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      await this.clientRepository.update(id, client);
      return this.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error updating client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async patch(
    id: number,
    client: PatchClientBodyDto,
  ): Promise<UpdateClientResponseDto> {
    try {
      const existingClient = await this.clientRepository.findOneBy({ id });
      if (!existingClient || existingClient === null) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      await this.clientRepository.update(id, client);
      return this.findById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error patching client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingClient = await this.clientRepository.findOneBy({ id });
      if (!existingClient || existingClient === null) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      await this.clientRepository.remove(existingClient);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error deleting client: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getClientInvoiceTotal(
    clientId: number,
  ): Promise<ClientTotalResponseDto> {
    try {
      // First check if client exists
      const client = await this.clientRepository.findOneBy({ id: clientId });
      if (!client || client === null) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }

      // Use SQL query to sum all invoice totals for this client
      const result: { clientId: string; total: string } | undefined =
        await this.clientRepository
          .createQueryBuilder('client')
          .leftJoin('client.invoices', 'invoice')
          .select('client.id', 'clientId')
          .addSelect('COALESCE(SUM(invoice.totalAmount), 0)', 'total')
          .where('client.id = :clientId', { clientId })
          .groupBy('client.id')
          .getRawOne();

      if (!result) {
        return {
          clientId,
          total: 0,
        };
      }

      return {
        clientId: Number(result.clientId),
        total: parseFloat(result.total) || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error calculating client invoice total: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
