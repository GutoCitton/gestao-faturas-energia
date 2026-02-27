import { useState, useEffect } from 'react'
import { invoicesApi } from '../api/invoices'
import { SummaryCard } from '../components/SummaryCard'
import { EnergyChart } from '../components/EnergyChart'
import { FinancialChart } from '../components/FinancialChart'

export function Dashboard() {
  const [clientNumber, setClientNumber] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [clients, setClients] = useState<string[]>([])
  const [totals, setTotals] = useState<{
    consumoTotal: number
    energiaCompensadaKwh: number
    valorTotalSemGD: number
    economiaGD: number
  } | null>(null)
  const [timeSeries, setTimeSeries] = useState<
    Array<{
      month: string
      consumoTotal: number
      energiaCompensadaKwh: number
      valorTotalSemGD: number
      economiaGD: number
    }>
  >([])

  useEffect(() => {
    invoicesApi.clients().then(setClients).catch(() => setClients([]))
  }, [])

  useEffect(() => {
    const params = { clientNumber: clientNumber || undefined, year: year || undefined }
    invoicesApi
      .dashboard(params)
      .then(({ totals: t, timeSeries: ts }) => {
        setTotals(t)
        setTimeSeries(ts)
      })
      .catch(() => {
        setTotals(null)
        setTimeSeries([])
      })
  }, [clientNumber, year])

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

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

      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Consumo Total (kWh)"
            value={totals.consumoTotal}
            unit="kWh"
          />
          <SummaryCard
            title="Energia Compensada (kWh)"
            value={totals.energiaCompensadaKwh}
            unit="kWh"
          />
          <SummaryCard
            title="Valor Total sem GD (R$)"
            value={totals.valorTotalSemGD}
            unit="R$"
          />
          <SummaryCard
            title="Economia GD (R$)"
            value={totals.economiaGD}
            unit="R$"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnergyChart data={timeSeries} />
        <FinancialChart data={timeSeries} />
      </div>
    </div>
  )
}
