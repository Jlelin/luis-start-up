import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [tokenStatus, setTokenStatus] = useState(null); // Novo estado para o status do token
  const [successMessage, setSuccessMessage] = useState(null); // Novo estado para a mensagem de sucesso
  const [failureMessage, setFailureMessage] = useState(null); // Novo estado para a mensagem de erro
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Realiza a requisição de login com o backend
      const response = await axios.post('http://localhost:3000/auth/login', { email, password });

      console.log("Resposta do login:", response); // Verifica a resposta do backend

      // Mostra apenas o valor do token recebido
      alert(`Token recebido: ${response.data.access_token}`);

      if (response.status === 200 && response.data.access_token) {
        // Armazena o token no localStorage
        console.log("Token recebido:", response.data.access_token); // Verifica o token

        // Verifique se o token foi armazenado corretamente
        const storedToken = localStorage.getItem('authToken');
        console.log("Token armazenado no localStorage:", storedToken);

        // Define o status do token
        setTokenStatus('Token recebido com sucesso');
        setSuccessMessage('Login realizado com sucesso!'); // Mensagem de sucesso

        // Navega para a página de upload ou dashboard após login bem-sucedido
        navigate('/upload');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
        setTokenStatus('Token não recebido');
        setFailureMessage('Falha ao autenticar. Tente novamente.'); // Mensagem de falha
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err); // Exibe o erro

      if (err.response && err.response.status === 401) {
        // Se a resposta do erro for 401, a senha foi inválida
        setError('Credenciais inválidas. Por favor, verifique seu email e senha.');
        setTokenStatus('Token não recebido');
        setFailureMessage('Credenciais inválidas. Por favor, tente novamente.');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
        setTokenStatus('Token não recebido');
        setFailureMessage('Erro ao autenticar. Tente novamente.');
      }
    }
  };

  // Função para fazer a requisição de upload de faturas, ou qualquer outra que precise de autenticação
  const uploadInvoice = async (formData) => {
    const token = localStorage.getItem('authToken'); // Recupera o token do localStorage
    if (!token) {
      setError('Token não encontrado. Por favor, faça login novamente.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Envia o token no cabeçalho
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Resposta do upload:', response);
      // Processar a resposta do upload
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setError('Erro ao enviar fatura.');
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
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {tokenStatus && <p>{tokenStatus}</p>}
        <button type="submit">Login</button>
      </form>

      {/* Exibe a mensagem de sucesso ou falha */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {failureMessage && <p style={{ color: 'red' }}>{failureMessage}</p>}

      {/* Aqui você pode ter o código para fazer o upload da fatura */}
      <button onClick={() => uploadInvoice(someFormData)}>Upload Fatura</button>
    </div>
  );
};

export default Login;
