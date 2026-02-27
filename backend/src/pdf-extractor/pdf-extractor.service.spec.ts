import { Test, TestingModule } from '@nestjs/testing';
import { PdfExtractorService } from './pdf-extractor.service';

jest.mock('pdf-parse', () => jest.fn());

describe('PdfExtractorService', () => {
  let service: PdfExtractorService;
  let pdfParseMock: jest.Mock;

  beforeEach(async () => {
    pdfParseMock = require('pdf-parse') as jest.Mock;
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfExtractorService],
    }).compile();
    service = module.get<PdfExtractorService>(PdfExtractorService);
  });

  it('should extract client number and reference month', async () => {
    pdfParseMock.mockResolvedValue({
      text: `
        Nº DO CLIENTE
        7202210726
        Referente a SET/2024
        Energia Elétrica kWh 100 1,04841351 104,81
        Energia SCEEE s/ ICMS kWh 1.860 0,58125187 1.081,12
        Energia compensada GD I kWh 1.860 0.56148931 -1.044,37
        Contrib Ilum Publica Municipal 47,57
      `,
    });

    const result = await service.extractFromBuffer(Buffer.from('mock'));

    expect(result.clientNumber).toBe('7202210726');
    expect(result.referenceMonth).toBe('SET/2024');
  });

  it('should extract energia eletrica values', async () => {
    pdfParseMock.mockResolvedValue({
      text: `
        Nº DO CLIENTE 7202210726
        Referente a SET/2024
        Energia Elétrica kWh 100 104,81
        Energia SCEEE s/ ICMS kWh 1.860 1.081,12
        Energia compensada GD I kWh 1.860 -1.044,37
        Contrib Ilum Publica Municipal 47,57
      `,
    });

    const result = await service.extractFromBuffer(Buffer.from('mock'));

    expect(result.energiaEletricaKwh).toBe(100);
    expect(result.energiaEletricaValue).toBeCloseTo(104.81, 2);
  });

  it('should extract energia SCEE values', async () => {
    pdfParseMock.mockResolvedValue({
      text: `
        Nº DO CLIENTE 7202210726
        Referente a SET/2024
        Energia Elétrica kWh 100 1,04 104,81
        Energia SCEEE s/ ICMS kWh 1.860 0,58 1.081,12
        Energia compensada GD I kWh 1.860 0.56 -1.044,37
        Contrib Ilum Publica Municipal 47,57
      `,
    });

    const result = await service.extractFromBuffer(Buffer.from('mock'));

    expect(result.energiaSceeeKwh).toBe(1860);
    expect(result.energiaSceeeValue).toBeCloseTo(1081.12, 2);
  });

  it('should extract energia compensada (negative value)', async () => {
    pdfParseMock.mockResolvedValue({
      text: `
        Nº DO CLIENTE 7202210726
        Referente a SET/2024
        Energia Elétrica kWh 100 1,04 104,81
        Energia SCEEE s/ ICMS kWh 1.860 0,58 1.081,12
        Energia compensada GD I kWh 1.860 0,56 -1.044,37
        Contrib Ilum Publica Municipal 47,57
      `,
    });

    const result = await service.extractFromBuffer(Buffer.from('mock'));

    expect(result.energiaCompensadaKwh).toBe(1860);
    expect(result.energiaCompensadaValue).toBeCloseTo(-1044.37, 2);
  });

  it('should extract contrib ilum publica', async () => {
    pdfParseMock.mockResolvedValue({
      text: `
        Nº DO CLIENTE 7202210726
        Referente a SET/2024
        Energia Elétrica kWh 100 104,81
        Energia SCEEE kWh 1.860 1.081,12
        Energia compensada GD I kWh 1.860 -1.044,37
        Contrib Ilum Publica Municipal 47,57
      `,
    });

    const result = await service.extractFromBuffer(Buffer.from('mock'));

    expect(result.contribIlumPublica).toBeCloseTo(47.57, 2);
  });

  it('should throw when PDF is empty', async () => {
    pdfParseMock.mockResolvedValue({ text: '' });

    await expect(service.extractFromBuffer(Buffer.from('mock'))).rejects.toThrow(
      'PDF appears empty or invalid',
    );
  });
});
