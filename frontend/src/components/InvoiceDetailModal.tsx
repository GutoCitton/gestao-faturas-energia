import type { Invoice } from '../api/invoices'

interface InvoiceDetailModalProps {
  invoice: Invoice | null
  open: boolean
  onClose: () => void
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function InvoiceDetailModal({
  invoice,
  open,
  onClose,
}: InvoiceDetailModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Detalhes da Fatura
            </h2>
            {invoice && (
              <p className="text-sm text-slate-500 mt-1">
                {invoice.referenceMonth} · Nº {invoice.clientNumber}
                {invoice.distributorName && ` · ${invoice.distributorName}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {invoice && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Itens da Fatura
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-700">
                    Unid.
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-700">
                    Quant.
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-700">
                    Valor (R$)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-2 text-slate-800">
                    Energia Elétrica
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600">kWh</td>
                  <td className="px-4 py-2 text-right text-slate-600">
                    {formatNumber(invoice.energiaEletricaKwh)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-800">
                    {formatCurrency(invoice.energiaEletricaValue)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-800">
                    Energia SCEE s/ ICMS
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600">kWh</td>
                  <td className="px-4 py-2 text-right text-slate-600">
                    {formatNumber(invoice.energiaSceeeKwh)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-800">
                    {formatCurrency(invoice.energiaSceeeValue)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-800">
                    Energia compensada GD I
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600">kWh</td>
                  <td className="px-4 py-2 text-right text-slate-600">
                    {formatNumber(invoice.energiaCompensadaKwh)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-800">
                    {formatCurrency(invoice.energiaCompensadaValue)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-800">
                    Contrib Ilum Publica Municipal
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600">—</td>
                  <td className="px-4 py-2 text-right text-slate-600">—</td>
                  <td className="px-4 py-2 text-right text-slate-800">
                    {formatCurrency(invoice.contribIlumPublica)}
                  </td>
                </tr>
                {invoice.ressarcimentoDanos !== 0 && (
                  <tr>
                    <td className="px-4 py-2 text-slate-800">
                      Ressarcimento de Danos
                    </td>
                    <td className="px-4 py-2 text-right text-slate-600">—</td>
                    <td className="px-4 py-2 text-right text-slate-600">—</td>
                    <td className="px-4 py-2 text-right text-slate-800">
                      {formatCurrency(invoice.ressarcimentoDanos)}
                    </td>
                  </tr>
                )}
                <tr className="bg-emerald-50 font-semibold">
                  <td className="px-4 py-3 text-slate-800" colSpan={3}>
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-800">
                    {formatCurrency(invoice.valorTotalSemGD)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
