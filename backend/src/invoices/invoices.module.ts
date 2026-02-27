import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PdfExtractorModule } from '../pdf-extractor/pdf-extractor.module';

@Module({
  imports: [PdfExtractorModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
