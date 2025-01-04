import React from 'react';
import { uploadFile } from './uploadService'; // Ou './invoiceService'

const FileUpload = () => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const uploadedUrl = await uploadFile(file); // Ou uploadInvoiceFile(file)
        console.log('Arquivo enviado com sucesso:', uploadedUrl);
      } catch (error) {
        console.error('Erro ao enviar o arquivo:', error.message);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

export default FileUpload;
