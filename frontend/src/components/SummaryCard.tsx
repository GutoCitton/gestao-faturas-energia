interface SummaryCardProps {
  title: string
  value: number
  unit: string
}

export function SummaryCard({ title, value, unit }: SummaryCardProps) {
  const formatted =
    unit === 'R$'
      ? value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
        })
      : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-xl font-semibold text-slate-800">{formatted}</p>
    </div>
  )
}
