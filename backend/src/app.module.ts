import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [PrismaModule, StorageModule, InvoicesModule],
})
export class AppModule {}
