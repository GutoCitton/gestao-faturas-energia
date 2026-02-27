import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfExtractorService } from '../pdf-extractor/pdf-extractor.service';
import { StorageService } from '../storage/storage.service';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfExtractor: PdfExtractorService,
    private readonly storageService: StorageService,
  ) {}

  async createFromPdf(objectKey: string, buffer: Buffer) {
    await this.storageService.upload(objectKey, buffer);
    const extracted = await this.pdfExtractor.extractFromBuffer(buffer);
    const consumoTotal =
      extracted.energiaEletricaKwh + extracted.energiaSceeeKwh;
    const valorTotalSemGD =
      extracted.energiaEletricaValue +
      extracted.energiaSceeeValue +
      extracted.contribIlumPublica;
    const economiaGD = Math.abs(extracted.energiaCompensadaValue);

    return this.prisma.invoice.upsert({
      where: {
        clientNumber_referenceMonth: {
          clientNumber: extracted.clientNumber,
          referenceMonth: extracted.referenceMonth,
        },
      },
      create: {
        clientNumber: extracted.clientNumber,
        referenceMonth: extracted.referenceMonth,
        distributorName: extracted.distributorName,
        energiaEletricaKwh: extracted.energiaEletricaKwh,
        energiaEletricaValue: extracted.energiaEletricaValue,
        energiaSceeeKwh: extracted.energiaSceeeKwh,
        energiaSceeeValue: extracted.energiaSceeeValue,
        energiaCompensadaKwh: extracted.energiaCompensadaKwh,
        energiaCompensadaValue: extracted.energiaCompensadaValue,
        contribIlumPublica: extracted.contribIlumPublica,
        consumoTotal,
        valorTotalSemGD,
        economiaGD,
        pdfPath: objectKey,
      },
      update: {
        distributorName: extracted.distributorName,
        energiaEletricaKwh: extracted.energiaEletricaKwh,
        energiaEletricaValue: extracted.energiaEletricaValue,
        energiaSceeeKwh: extracted.energiaSceeeKwh,
        energiaSceeeValue: extracted.energiaSceeeValue,
        energiaCompensadaKwh: extracted.energiaCompensadaKwh,
        energiaCompensadaValue: extracted.energiaCompensadaValue,
        contribIlumPublica: extracted.contribIlumPublica,
        consumoTotal,
        valorTotalSemGD,
        economiaGD,
        pdfPath: objectKey,
      },
    });
  }

  async findAll(query: QueryInvoiceDto) {
    const where: Record<string, unknown> = {};

    if (query.clientNumber) {
      where.clientNumber = query.clientNumber;
    }
    if (query.year) {
      where.referenceMonth = {
        endsWith: `/${query.year}`,
      };
    }
    if (query.month) {
      where.referenceMonth = {
        ...(query.year && { endsWith: `/${query.year}` }),
        contains: query.month,
      };
    }

    return this.prisma.invoice.findMany({
      where,
      orderBy: [{ referenceMonth: 'desc' }, { clientNumber: 'asc' }],
    });
  }

  async getDashboard(query: QueryInvoiceDto) {
    const invoices = await this.findAll(query);

    const totals = invoices.reduce(
      (acc, inv) => ({
        consumoTotal: acc.consumoTotal + inv.consumoTotal,
        energiaCompensadaKwh: acc.energiaCompensadaKwh + inv.energiaCompensadaKwh,
        valorTotalSemGD: acc.valorTotalSemGD + inv.valorTotalSemGD,
        economiaGD: acc.economiaGD + inv.economiaGD,
      }),
      {
        consumoTotal: 0,
        energiaCompensadaKwh: 0,
        valorTotalSemGD: 0,
        economiaGD: 0,
      },
    );

    const byMonth = invoices.reduce<Record<string, typeof totals>>((acc, inv) => {
      const key = inv.referenceMonth;
      if (!acc[key]) {
        acc[key] = {
          consumoTotal: 0,
          energiaCompensadaKwh: 0,
          valorTotalSemGD: 0,
          economiaGD: 0,
        };
      }
      acc[key].consumoTotal += inv.consumoTotal;
      acc[key].energiaCompensadaKwh += inv.energiaCompensadaKwh;
      acc[key].valorTotalSemGD += inv.valorTotalSemGD;
      acc[key].economiaGD += inv.economiaGD;
      return acc;
    }, {});

    const timeSeries = Object.entries(byMonth)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { totals, timeSeries };
  }

  async getDistinctClients() {
    const result = await this.prisma.invoice.findMany({
      select: { clientNumber: true },
      distinct: ['clientNumber'],
      orderBy: { clientNumber: 'asc' },
    });
    return result.map((r) => r.clientNumber);
  }

  async getDownloadStream(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    const stream = await this.storageService.getStream(invoice.pdfPath);
    return {
      stream,
      filename: `fatura_${invoice.clientNumber}_${invoice.referenceMonth.replace('/', '-')}.pdf`,
    };
  }
}
