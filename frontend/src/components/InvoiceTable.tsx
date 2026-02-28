import { useState } from 'react'
import type { Invoice } from '../api/invoices'
import { invoicesApi } from '../api/invoices'
import { InvoiceDetailModal } from './InvoiceDetailModal'

interface InvoiceTableProps {
  invoices: Invoice[]
  onDelete?: (id: string) => void
}

export function InvoiceTable({ invoices, onDelete }: InvoiceTableProps) {
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleDownload = (id: string) => {
    window.open(invoicesApi.downloadUrl(id), '_blank')
  }

  const openDetail = (inv: Invoice) => {
    setDetailInvoice(inv)
    setDetailOpen(true)
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-slate-500">
        Nenhuma fatura encontrada.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-emerald-700 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Nº do Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Mês/Ano
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase">
              Distribuidora
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase">
              Consumo (kWh)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase">
              Valor sem GD (R$)
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-800">
                {inv.clientNumber}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {inv.referenceMonth}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                {inv.distributorName ?? '-'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600">
                {inv.consumoTotal.toLocaleString('pt-BR', {
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-600">
                {inv.valorTotalSemGD.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => openDetail(inv)}
                    className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => handleDownload(inv.id)}
                    className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    PDF
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta fatura?')) {
                          onDelete(inv.id)
                        }
                      }}
                      className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                    >
                      Deletar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <InvoiceDetailModal
        invoice={detailInvoice}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
