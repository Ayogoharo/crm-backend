import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceItemsService } from './invoice-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceItem])],
  providers: [InvoiceItemsService],
  exports: [InvoiceItemsService],
})
export class InvoiceItemsModule {}
