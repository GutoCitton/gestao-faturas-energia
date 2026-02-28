import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

export interface Invoice {
  id: string
  clientNumber: string
  referenceMonth: string
  distributorName: string | null
  energiaEletricaKwh: number
  energiaEletricaValue: number
  energiaSceeeKwh: number
  energiaSceeeValue: number
  energiaCompensadaKwh: number
  energiaCompensadaValue: number
  contribIlumPublica: number
  consumoTotal: number
  valorTotalSemGD: number
  economiaGD: number
  pdfPath: string
  createdAt: string
}

export interface DashboardData {
  totals: {
    consumoTotal: number
    energiaCompensadaKwh: number
    valorTotalSemGD: number
    economiaGD: number
  }
  timeSeries: Array<{
    month: string
    consumoTotal: number
    energiaCompensadaKwh: number
    valorTotalSemGD: number
    economiaGD: number
  }>
}

export interface QueryParams {
  clientNumber?: string
  year?: string
  month?: string
}

export const invoicesApi = {
  list: (params?: QueryParams) =>
    api.get<Invoice[]>('/invoices', { params }).then((r) => r.data),

  dashboard: (params?: QueryParams) =>
    api.get<DashboardData>('/invoices/dashboard', { params }).then((r) => r.data),

  clients: () =>
    api.get<string[]>('/invoices/clients').then((r) => r.data),

  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<Invoice>('/invoices/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  downloadUrl: (id: string) =>
    `${import.meta.env.VITE_API_URL ?? '/api'}/invoices/${id}/download`,

  delete: (id: string) => api.delete(`/invoices/${id}`),
}
