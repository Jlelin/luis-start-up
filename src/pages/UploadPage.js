// /src/pages/UploadPage.js
import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF).');
        setSelectedFile(null);
        setPreview(null);
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrorMessage('O arquivo é muito grande. O tamanho máximo permitido é 5MB.');
        setSelectedFile(null);
        setPreview(null);
        return;
      }

      setErrorMessage('');
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo antes de enviar.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:3000/invoices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponseMessage('Fatura enviada com sucesso!');
      console.log(response.data);
    } catch (error) {
      setResponseMessage('Erro ao enviar o arquivo.');
      console.error('Erro completo:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload de Fatura</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="file-upload" style={{ cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', padding: '10px', borderRadius: '5px' }}>
          Selecione uma imagem de fatura
        </label>
        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        <button type="submit" disabled={uploading}>Enviar</button>
      </form>

      {uploading && <p>Carregando...</p>}
      {responseMessage && <p>{responseMessage}</p>}
      {preview && (
        <div>
          <h2>Pré-visualização:</h2>
          <img src={preview} alt="Pré-visualização da fatura" style={{ width: '300px', marginTop: '10px' }} />
        </div>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {selectedFile && !preview && <p>Arquivo selecionado: {selectedFile.name}</p>}
      {preview && <p>Pré-visualização disponível! Agora, você pode enviar.</p>}
    </div>
  );
};

export default UploadPage;
