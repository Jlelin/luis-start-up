import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaModule } from '../prisma/prisma.module';  // Importando PrismaModule
import { FileUploadModule } from './file-upload.module';  // Importando FileUploadModule

@Module({
  imports: [PrismaModule, FileUploadModule],  // Certifique-se de que o FileUploadModule está sendo importado
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
