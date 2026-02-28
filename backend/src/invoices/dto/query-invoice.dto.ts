import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryInvoiceDto {
  @ApiPropertyOptional({ description: 'Número do cliente' })
  clientNumber?: string;

  @ApiPropertyOptional({ description: 'Ano de referência (ex: 2024)' })
  year?: string;

  @ApiPropertyOptional({ description: 'Mês de referência' })
  month?: string;
}
