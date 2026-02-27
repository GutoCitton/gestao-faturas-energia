import { useState, useEffect, useCallback } from 'react'
import { invoicesApi, type Invoice } from '../api/invoices'
import { InvoiceTable } from '../components/InvoiceTable'
import { UploadModal } from '../components/UploadModal'

export function InvoiceLibrary() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [clientNumber, setClientNumber] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const fetchInvoices = useCallback(() => {
    const params = { clientNumber: clientNumber || undefined, year: year || undefined }
    invoicesApi
      .list(params)
      .then(setInvoices)
      .catch(() => setInvoices([]))
  }, [clientNumber, year])

  useEffect(() => {
    invoicesApi.clients().then(setClients).catch(() => setClients([]))
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Biblioteca de Faturas</h1>
        <button
          onClick={() => setUploadOpen(true)}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Enviar fatura (PDF)
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Consumidor</label>
          <select
            value={clientNumber}
            onChange={(e) => setClientNumber(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Ano</label>
          <div className="flex gap-1">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(year === String(y) ? '' : String(y))}
                className={`rounded px-3 py-2 text-sm font-medium ${
                  year === String(y)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <InvoiceTable invoices={invoices} />

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false)
          fetchInvoices()
        }}
      />
    </div>
  )
}
