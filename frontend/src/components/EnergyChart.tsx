import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  month: string
  consumoTotal: number
  energiaCompensadaKwh: number
  valorTotalSemGD: number
  economiaGD: number
}

interface EnergyChartProps {
  data: DataPoint[]
}

export function EnergyChart({ data }: EnergyChartProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Resultados de Energia (kWh)
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
              }
            />
            <Legend />
            <Bar
              dataKey="consumoTotal"
              name="Consumo de Energia Elétrica (kWh)"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="energiaCompensadaKwh"
              name="Energia Compensada (kWh)"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
