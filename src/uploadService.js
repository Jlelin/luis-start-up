import axios from 'axios';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('http://localhost:3000/invoices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Retorna a URL ou o resultado do upload
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
    throw error;
  }
}
