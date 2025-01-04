import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';  // Importando FileUploadService

@Module({
  providers: [FileUploadService],
  exports: [FileUploadService],  // Certifique-se de que o FileUploadService está sendo exportado
})
export class FileUploadModule {}
