import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { extname } from 'path';
import { InvoicesService } from './invoices.service';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const buffer = file.buffer;
    const objectKey = `invoices/${Date.now()}-${Math.random().toString(36).slice(2)}${extname(file.originalname) || '.pdf'}`;
    const invoice = await this.invoicesService.createFromPdf(objectKey, buffer);
    return invoice;
  }

  @Get()
  findAll(@Query() query: QueryInvoiceDto) {
    return this.invoicesService.findAll(query);
  }

  @Get('dashboard')
  getDashboard(@Query() query: QueryInvoiceDto) {
    return this.invoicesService.getDashboard(query);
  }

  @Get('clients')
  getClients() {
    return this.invoicesService.getDistinctClients();
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { stream, filename } = await this.invoicesService.getDownloadStream(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  }
}
