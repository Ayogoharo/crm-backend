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
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientBodyDto } from './dto/create-client-body.dto';
import { CreateClientResponseDto } from './dto/create-client-response.dto';
import { FindAllClientsResponseDto } from './dto/find-all-clients-response.dto';
import { FindByIdResponseDto } from './dto/find-by-id-response.dto';
import { UpdateClientBodyDto } from './dto/update-client-body.dto';
import { PatchClientBodyDto } from './dto/patch-client-body.dto';
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

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientBodyDto,
  ): Promise<UpdateClientResponseDto> {
    return this.clientsService.update(id, updateClientDto);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchClientDto: PatchClientBodyDto,
  ): Promise<UpdateClientResponseDto> {
    return this.clientsService.patch(id, patchClientDto);
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
