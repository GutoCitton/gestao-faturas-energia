export class CreateInvoiceDto {
  clientNumber: string;
  referenceMonth: string;
  distributorName?: string;
  energiaEletricaKwh: number;
  energiaEletricaValue: number;
  energiaSceeeKwh: number;
  energiaSceeeValue: number;
  energiaCompensadaKwh: number;
  energiaCompensadaValue: number;
  contribIlumPublica: number;
  consumoTotal: number;
  valorTotalSemGD: number;
  economiaGD: number;
  pdfPath: string;
}
