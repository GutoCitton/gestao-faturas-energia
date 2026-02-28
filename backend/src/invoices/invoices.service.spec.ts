import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfExtractorService } from '../pdf-extractor/pdf-extractor.service';
import { StorageService } from '../storage/storage.service';
import { Readable } from 'stream';

const mockPrisma = {
  invoice: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockPdfExtractor = {
  extractFromBuffer: jest.fn(),
};

const mockStorageService = {
  upload: jest.fn(),
  getStream: jest.fn(),
};

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PdfExtractorService, useValue: mockPdfExtractor },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();
    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('createFromPdf', () => {
    it('should compute consumoTotal and valorTotalSemGD correctly', async () => {
      mockStorageService.upload.mockResolvedValue(undefined);
      mockPdfExtractor.extractFromBuffer.mockResolvedValue({
        clientNumber: '7202210726',
        referenceMonth: 'SET/2024',
        energiaEletricaKwh: 100,
        energiaEletricaValue: 104.81,
        energiaSceeeKwh: 1860,
        energiaSceeeValue: 1081.12,
        energiaCompensadaKwh: 1860,
        energiaCompensadaValue: -1044.37,
        contribIlumPublica: 47.57,
        ressarcimentoDanos: 0,
      });

      mockPrisma.invoice.upsert.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      const buffer = Buffer.from('mock');
      await service.createFromPdf('invoices/test.pdf', buffer);

      expect(mockStorageService.upload).toHaveBeenCalledWith(
        'invoices/test.pdf',
        buffer,
      );
      const upsertCall = mockPrisma.invoice.upsert.mock.calls[0][0];
      expect(upsertCall.create.consumoTotal).toBe(1960);
      expect(upsertCall.create.valorTotalSemGD).toBeCloseTo(1233.5, 2);
      expect(upsertCall.create.ressarcimentoDanos).toBe(0);
      expect(upsertCall.create.economiaGD).toBeCloseTo(1044.37, 2);
    });

    it('should include ressarcimentoDanos in valorTotalSemGD when no valorAPagar', async () => {
      mockStorageService.upload.mockResolvedValue(undefined);
      mockPdfExtractor.extractFromBuffer.mockResolvedValue({
        clientNumber: '7202210726',
        referenceMonth: 'SET/2024',
        energiaEletricaKwh: 100,
        energiaEletricaValue: 100,
        energiaSceeeKwh: 100,
        energiaSceeeValue: 100,
        energiaCompensadaKwh: 0,
        energiaCompensadaValue: 0,
        contribIlumPublica: 50,
        ressarcimentoDanos: 12.5,
      });

      mockPrisma.invoice.upsert.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      await service.createFromPdf('invoices/test.pdf', Buffer.from('mock'));

      const upsertCall = mockPrisma.invoice.upsert.mock.calls[0][0];
      expect(upsertCall.create.ressarcimentoDanos).toBe(12.5);
      expect(upsertCall.create.valorTotalSemGD).toBeCloseTo(262.5, 2); // 100+100+50+12.5
    });
  });

  describe('getDashboard', () => {
    it('should aggregate totals from invoices', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([
        {
          consumoTotal: 100,
          energiaCompensadaKwh: 50,
          valorTotalSemGD: 200,
          economiaGD: 80,
          referenceMonth: 'SET/2024',
        },
        {
          consumoTotal: 200,
          energiaCompensadaKwh: 100,
          valorTotalSemGD: 300,
          economiaGD: 120,
          referenceMonth: 'SET/2024',
        },
      ]);

      const result = await service.getDashboard({});

      expect(result.totals.consumoTotal).toBe(300);
      expect(result.totals.energiaCompensadaKwh).toBe(150);
      expect(result.totals.valorTotalSemGD).toBe(500);
      expect(result.totals.economiaGD).toBe(200);
    });
  });

  describe('getDownloadStream', () => {
    it('should throw NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);

      await expect(
        service.getDownloadStream('550e8400-e29b-41d4-a716-446655440000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return stream from storage', async () => {
      const mockStream = new Readable();
      mockStorageService.getStream.mockResolvedValue(mockStream);

      mockPrisma.invoice.findUnique.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        clientNumber: '7202210726',
        referenceMonth: 'SET/2024',
        pdfPath: 'invoices/test.pdf',
      });

      const result = await service.getDownloadStream(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(mockStorageService.getStream).toHaveBeenCalledWith(
        'invoices/test.pdf',
      );
      expect(result.stream).toBe(mockStream);
      expect(result.filename).toContain('fatura_7202210726_SET-2024');
    });
  });
});
