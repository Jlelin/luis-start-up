import axios from 'axios';

// Defina a URL base do seu servidor backend
const API_URL = 'http://localhost:3000/auth'; // URL base sem '/register'

// Função para registrar um novo usuário
export const register = async (userData) => {
  try {
    // Envia uma requisição POST para o backend com os dados do usuário
    const response = await axios.post(`${API_URL}/register`, userData);

    // Se a requisição for bem-sucedida, retornamos os dados de resposta
    return response.data; // Isso pode ser um objeto com dados do usuário ou um status de sucesso
  } catch (error) {
    // Caso ocorra um erro, tratamos e lançamos um erro com uma mensagem personalizada
    throw new Error(error.response?.data?.message || 'Erro desconhecido ao registrar');
  }
};

// Função para fazer login do usuário
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data; // Retorna os dados do login (geralmente um token JWT ou dados do usuário)
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer login');
  }
};

// Função para fazer logout do usuário (exemplo simples)
export const logout = () => {
  localStorage.removeItem('user'); // Se você estiver usando o localStorage para armazenar os dados do usuário
};

// Função para obter o usuário autenticado
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user')); // Exemplo de como obter o usuário do localStorage
};
