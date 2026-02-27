# Aplicação para faturas de energia 

O aplicativo irá extrair, armazenar e visualizar dados de contas de energia elétrica.

## Stacks

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: React + Vite + Tailwind + Recharts
- **Storage**: MinIO (S3-compatible)
- **PDF extraction**: pdf-parse

## Setup

### 1. Subir Docker services (PostgreSQL + MinIO)

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
pnpm install   # ou npm install
cp .env.example .env   # ajuste a DATABASE_URL e S3_* caso necessário
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir na url http://localhost:5173 para o frontend. O backend rodará em http://localhost:3000.

## Features

- **Upload**: Faça o upload de PDFs das contas de energia através da página da Biblioteca de Faturas.
- **Extração**: O sistema processa PDFs e extrai os dados de energia e od dados financeiros.
- **Dashboard**: Resumos e gráficos (kWh and R$)
- **Biblioteca de Faturas**: Filtre por cliente/ano e baixe PDFs.
