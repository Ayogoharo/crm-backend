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
import { ClientsService } from './clients.service';
import { CreateClientBodyDto } from './dto/create-client-body.dto';
import { CreateClientResponseDto } from './dto/create-client-response.dto';
import { FindAllClientsResponseDto } from './dto/find-all-clients-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateClientBodyDto } from './dto/update-client-body.dto';
import { UpdateClientResponseDto } from './dto/update-client-response.dto';
import { ClientTotalResponseDto } from './dto/client-total-response.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(
    @Body() createClientDto: CreateClientBodyDto,
  ): Promise<CreateClientResponseDto> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  async findAll(): Promise<FindAllClientsResponseDto> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindByIdResponseDto> {
    return this.clientsService.findById(id);
  }

  @Put()
  async update(
    @Body() updateClientDto: UpdateClientBodyDto,
  ): Promise<UpdateClientResponseDto> {
    return this.clientsService.update(updateClientDto.id, updateClientDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.clientsService.delete(id);
  }

  @Get('total/:id')
  async getClientTotal(
    @Param('id', ParseIntPipe) clientId: number,
  ): Promise<ClientTotalResponseDto> {
    return this.clientsService.getClientInvoiceTotal(clientId);
  }
}
