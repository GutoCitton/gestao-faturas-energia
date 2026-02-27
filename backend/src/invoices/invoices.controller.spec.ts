import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

const mockInvoicesService = {
  createFromPdf: jest.fn(),
  findAll: jest.fn(),
  getDashboard: jest.fn(),
  getDistinctClients: jest.fn(),
  getDownloadStream: jest.fn(),
};

describe('InvoicesController', () => {
  let controller: InvoicesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: mockInvoicesService,
        },
      ],
    }).compile();
    controller = module.get<InvoicesController>(InvoicesController);
  });

  describe('findAll', () => {
    it('should delegate to service with query params', async () => {
      mockInvoicesService.findAll.mockResolvedValue([]);

      await controller.findAll({
        clientNumber: '7202210726',
        year: '2024',
      });

      expect(mockInvoicesService.findAll).toHaveBeenCalledWith({
        clientNumber: '7202210726',
        year: '2024',
      });
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard data from service', async () => {
      const mockData = {
        totals: {
          consumoTotal: 100,
          energiaCompensadaKwh: 50,
          valorTotalSemGD: 200,
          economiaGD: 80,
        },
        timeSeries: [],
      };
      mockInvoicesService.getDashboard.mockResolvedValue(mockData);

      const result = await controller.getDashboard({ year: '2024' });

      expect(result).toEqual(mockData);
      expect(mockInvoicesService.getDashboard).toHaveBeenCalledWith({
        year: '2024',
      });
    });
  });

  describe('upload', () => {
    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.upload(undefined as never)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
