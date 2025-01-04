// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Requisição ao backend para login
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: email,
        password: password,
      });

      // Se a requisição for bem-sucedida, armazene o token no localStorage
      if (response.data.access_token) { // Armazena o token
        navigate('/upload'); // Redireciona para a página de upload
      }
    } catch (error) {
      setError('Credenciais inválidas.');  // Exibe erro caso a autenticação falhe
    }
  };

  const handleFetchData = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.log('Token não encontrado');
      return;
    }

    try {
      // Requisição para um endpoint protegido (com o token no cabeçalho)
      const response = await axios.get('http://localhost:3000/protected-endpoint', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao acessar o endpoint protegido:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>} {/* Mostra mensagem de erro */}
        <button type="submit">Login</button>
      </form>
      <button onClick={handleFetchData}>Acessar dados protegidos</button>
      <p>
        Não tem uma conta? <a href="/register">Cadastre-se aqui</a>
      </p>
    </div>
  );
};

export default LoginPage;
