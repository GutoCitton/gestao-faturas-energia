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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { extname } from 'path';
import { InvoicesService } from './invoices.service';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Enviar fatura em PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Arquivo PDF da fatura' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fatura processada e salva' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou ausente' })
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
  @ApiOperation({ summary: 'Listar faturas' })
  @ApiQuery({ name: 'clientNumber', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'month', required: false })
  @ApiResponse({ status: 200, description: 'Lista de faturas' })
  findAll(@Query() query: QueryInvoiceDto) {
    return this.invoicesService.findAll(query);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Dados agregados para dashboard' })
  @ApiQuery({ name: 'clientNumber', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'month', required: false })
  @ApiResponse({ status: 200, description: 'Totais e série temporal' })
  getDashboard(@Query() query: QueryInvoiceDto) {
    return this.invoicesService.getDashboard(query);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Listar números de clientes distintos' })
  @ApiResponse({ status: 200, description: 'Lista de números de cliente' })
  getClients() {
    return this.invoicesService.getDistinctClients();
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download do PDF da fatura' })
  @ApiParam({ name: 'id', description: 'ID da fatura' })
  @ApiResponse({ status: 200, description: 'Arquivo PDF' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
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
