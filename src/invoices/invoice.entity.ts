import { Invoice as PrismaInvoice } from '@prisma/client';

/**
 * A classe `InvoiceEntity` reflete a estrutura de uma fatura.
 */
export class InvoiceEntity implements PrismaInvoice {
  id: number; // ID da fatura
  name: string; // Nome da fatura
  description: string | null; // Descrição opcional
  image: Buffer; // Imagem como bytes
  createdAt: Date; // Data de criação
  userId: number; // ID do usuário associado à fatura

  constructor(partial: Partial<InvoiceEntity>) {
    Object.assign(this, partial);
  }
}

// Exporta o tipo Prisma diretamente
export type Invoice = PrismaInvoice;
