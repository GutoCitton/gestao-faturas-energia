-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "clientNumber" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "distributorName" TEXT,
    "energiaEletricaKwh" DOUBLE PRECISION NOT NULL,
    "energiaEletricaValue" DOUBLE PRECISION NOT NULL,
    "energiaSceeeKwh" DOUBLE PRECISION NOT NULL,
    "energiaSceeeValue" DOUBLE PRECISION NOT NULL,
    "energiaCompensadaKwh" DOUBLE PRECISION NOT NULL,
    "energiaCompensadaValue" DOUBLE PRECISION NOT NULL,
    "contribIlumPublica" DOUBLE PRECISION NOT NULL,
    "consumoTotal" DOUBLE PRECISION NOT NULL,
    "valorTotalSemGD" DOUBLE PRECISION NOT NULL,
    "economiaGD" DOUBLE PRECISION NOT NULL,
    "pdfPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_clientNumber_referenceMonth_key" ON "Invoice"("clientNumber", "referenceMonth");
