import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [page, setPage] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loadingPage, setLoadingPage] = useState(false);
  const [authToken, setAuthToken] = useState(''); // Estado para armazenar o token

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
    const token = localStorage.getItem('authToken'); 
    if (!token) {
      setErrorMessage('Token de autenticação não encontrado. Faça login novamente.');
      return;
    }

    if (!selectedFile) {
      alert('Por favor, selecione um arquivo antes de enviar.');
      return;
    }

    setUploading(true); 
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:3000/invoices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setResponseMessage('Fatura enviada com sucesso!');
    } catch (error) {
      setResponseMessage('Erro ao enviar o arquivo.');
    } finally {
      setUploading(false); 
    }
  };

  const handlePageChange = (newPage) => {
    setLoadingPage(true);
    setTimeout(() => {
      setPage(newPage);
      setLoadingPage(false);
    }, 1000);
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/register', {
        name,
        email,
        password,
      });
      alert('Usuário registrado com sucesso!');
      handlePageChange('login');
    } catch (error) {
      alert('Erro ao registrar o usuário. Tente novamente.');
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      const token = response.data.access_token;
      localStorage.setItem('authToken', token);
      setAuthToken(token); // Armazenar o token no estado
      setIsTokenSet(true);
      handlePageChange('upload');
    } catch (error) {
      alert('Email ou senha incorretos!');
    }
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    if (!userMessage.trim()) return;

    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage }]);

    try {
      // Conexão com o GPT-J (exemplo de API para GPT-J)
      const gptResponse = await axios.post('http://localhost:3000/model/answer-question', { message: userMessage }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: gptResponse.data.reply },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Desculpe, houve um erro ao conectar com o GPT-J.' },
      ]);
    }

    setUserMessage('');
  };

  return (
    <div>
      {loadingPage && <div style={{ textAlign: 'center' }}>Carregando...</div>}

      {page === 'register' && (
        <div>
          <h1>Registro</h1>
          <form onSubmit={handleRegisterSubmit}>
            <label>
              Nome:
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <br />
            <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <br />
            <label>
              Senha:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <br />
            <label>
              Confirmar Senha:
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>
            <br />
            <button type="submit">Registrar</button>
          </form>
          <p>
            Já tem uma conta? <button onClick={() => handlePageChange('login')}>Fazer login</button>
          </p>
        </div>
      )}

      {page === 'login' && (
        <div>
          <h1>Login</h1>
          <form onSubmit={handleLoginSubmit}>
            <label>
              Email:
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </label>
            <br />
            <label>
              Senha:
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </label>
            <br />
            <button type="submit">Entrar</button>
          </form>
          <p>
            Não tem uma conta? <button onClick={() => handlePageChange('register')}>Registrar</button>
          </p>
        </div>
      )}

      {isTokenSet && authToken && (
        <div>
          <h2>Token de autenticação:</h2>
          <p>{authToken}</p>
        </div>
      )}

      {page === 'upload' && (
        <div>
          <h1>Upload de Fatura</h1>
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="file-upload"
              style={{ cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', padding: '10px', borderRadius: '5px' }}
            >
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
      )}

      <button onClick={() => setChatVisible(!chatVisible)}>
        {chatVisible ? 'Fechar Chat' : 'Abrir Chat'}
      </button>

      {chatVisible && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', maxWidth: '500px' }}>
          <h3>Chat com GPT-J</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' }}>
            {messages.map((msg, index) => (
              <p key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <strong>{msg.sender === 'user' ? 'Você' : 'Bot'}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <form onSubmit={handleChatSubmit}>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Digite sua mensagem"
              rows="3"
              style={{ width: '100%' }}
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
