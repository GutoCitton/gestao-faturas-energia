import { Injectable } from '@nestjs/common';
const pdfParse = require('pdf-parse');

export interface ExtractedInvoiceData {
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
}

function parseBrazilianNumber(str: string): number {
  const cleaned = str.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

@Injectable()
export class PdfExtractorService {
  async extractFromBuffer(buffer: Buffer): Promise<ExtractedInvoiceData> {
    const result = await pdfParse(buffer);
    const text = result.text;

    if (!text || text.length < 50) {
      throw new Error('PDF appears empty or invalid');
    }

    const clientNumber = this.extractClientNumber(text);
    const referenceMonth = this.extractReferenceMonth(text);
    const distributorName = this.extractDistributor(text);

    const energiaEletrica = this.extractEnergiaEletrica(text);
    const energiaSceee = this.extractEnergiaSceee(text);
    const energiaCompensada = this.extractEnergiaCompensada(text);
    const contribIlumPublica = this.extractContribIlumPublica(text);

    return {
      clientNumber,
      referenceMonth,
      distributorName,
      energiaEletricaKwh: energiaEletrica.kwh,
      energiaEletricaValue: energiaEletrica.value,
      energiaSceeeKwh: energiaSceee.kwh,
      energiaSceeeValue: energiaSceee.value,
      energiaCompensadaKwh: energiaCompensada.kwh,
      energiaCompensadaValue: energiaCompensada.value,
      contribIlumPublica,
    };
  }

  private extractClientNumber(text: string): string {
    const instalaçãoMatch = text.match(
      /N[º°]?\s*DO\s*CLIENTE\s+N[º°]?\s*DA\s*INSTALA[ÇC][ÃA]O\s*\n\s*(\d{8,})\s+(\d{8,})/i,
    );
    if (instalaçãoMatch?.[1]) return instalaçãoMatch[1].trim();

    const patterns = [
      /N[º°]?\s*DO\s*CLIENTE\s*[\s:\-]*\s*(\d{8,})/i,
      /CLIENTE\s*[\s:\-]*\s*(\d{8,})/i,
      /N[º°]\s*CLIENTE\s*[\s:\-]*\s*(\d{8,})/i,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m?.[1]) return m[1].trim();
    }
    const fallback = text.match(/(\d{9,11})/);
    if (fallback) return fallback[1];
    throw new Error('Client number not found in PDF');
  }

  private extractReferenceMonth(text: string): string {
    const monthYear = text.match(
      /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s*\/\s*(\d{4})/i,
    );
    if (monthYear) {
      return `${monthYear[1].toUpperCase()}/${monthYear[2]}`;
    }
    const alt = text.match(/(\d{2})\s*\/\s*(\d{4})/);
    if (alt) {
      const monthMap: Record<string, string> = {
        '01': 'JAN', '02': 'FEV', '03': 'MAR', '04': 'ABR',
        '05': 'MAI', '06': 'JUN', '07': 'JUL', '08': 'AGO',
        '09': 'SET', '10': 'OUT', '11': 'NOV', '12': 'DEZ',
      };
      return `${monthMap[alt[1]] || alt[1]}/${alt[2]}`;
    }
    throw new Error('Reference month not found in PDF');
  }

  private extractDistributor(text: string): string | undefined {
    const known = ['CEMIG', 'CPFL', 'ENERGISA', 'ENEL', 'EDP', 'LIGHT'];
    for (const d of known) {
      if (text.toUpperCase().includes(d)) return d;
    }
    return undefined;
  }

  private sliceUntilNextSection(text: string, start: number, maxLen: number): string {
    const end = Math.min(start + maxLen, text.length);
    let chunk = text.slice(start, end);
    const nextSection = chunk.search(/\n\s*(?:Energia|Contrib)/i);
    if (nextSection > 0) chunk = chunk.slice(0, nextSection);
    return chunk;
  }

  private parseKwhAndValue(numbers: string[]): { kwh: number; value: number } {
    if (!numbers || numbers.length < 2) return { kwh: 0, value: 0 };
    const kwh = parseBrazilianNumber(numbers[0]);
    const value =
      numbers.length >= 3
        ? parseBrazilianNumber(numbers[2])
        : parseBrazilianNumber(numbers[1]);
    return { kwh, value };
  }

  private extractEnergiaEletrica(text: string): { kwh: number; value: number } {
    const re = /Energia\s+El[eé]trica(?:\s+kWh)?/i;
    const idx = text.search(re);
    if (idx < 0) return { kwh: 0, value: 0 };
    const chunk = this.sliceUntilNextSection(text, idx, 120);
    const numbers = chunk.match(/(-?[\d.]+(?:,\d+)?)/g);
    return this.parseKwhAndValue(numbers ?? []);
  }

  private extractEnergiaSceee(text: string): { kwh: number; value: number } {
    const re = /Energia\s+SCE+E?\s*(?:s\/?\s*ICMS)?/i;
    const idx = text.search(re);
    if (idx < 0) return { kwh: 0, value: 0 };
    const chunk = this.sliceUntilNextSection(text, idx, 150);
    const numbers = chunk.match(/(-?[\d.]+(?:,\d+)?)/g);
    return this.parseKwhAndValue(numbers ?? []);
  }

  private extractEnergiaCompensada(text: string): {
    kwh: number;
    value: number;
  } {
    const re = /Energia\s+compensada\s+GD\s*I?/i;
    const idx = text.search(re);
    if (idx < 0) return { kwh: 0, value: 0 };
    const chunk = this.sliceUntilNextSection(text, idx, 150);
    const numbers = chunk.match(/(-?[\d.]+(?:,\d+)?)/g);
    return this.parseKwhAndValue(numbers ?? []);
  }

  private extractContribIlumPublica(text: string): number {
    const re = /Contrib\s*(?:Ilum|Ilumina[çc][ãa]o)?\s*Publica\s*Municipal/i;
    const idx = text.search(re);
    if (idx < 0) return 0;
    const chunk = text.slice(idx, idx + 80);
    const m = chunk.match(/(-?[\d.,]+)/);
    return m ? parseBrazilianNumber(m[1]) : 0;
  }
}
