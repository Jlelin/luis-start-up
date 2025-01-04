-- CreateTable
CREATE TABLE "ExtractedText" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ExtractedText_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExtractedText" ADD CONSTRAINT "ExtractedText_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedText" ADD CONSTRAINT "ExtractedText_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
