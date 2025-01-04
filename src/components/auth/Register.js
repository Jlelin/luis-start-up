import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService'; // Serviço para enviar os dados

const Register = () => {
  // Definição dos estados para os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null); // Para exibir erros
  const navigate = useNavigate(); // Navegação após sucesso

  // Função para registrar o usuário
  const handleRegister = async (e) => {
    e.preventDefault();

    // Verificando se as senhas coincidem
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // Definindo o userData com os dados do formulário
    const userData = { name, email, password };

    // Exibindo o userData no console para debug
    console.log('Dados do usuário:', userData);

    try {
      // Chamando o serviço de registro, passando os dados
      const response = await register(userData);
      if (response) {
        // Redirecionando para a página de login após sucesso
        navigate('/login');
      }
    } catch (err) {
      console.error('Erro ao registrar o usuário:', err);
      setError('Erro ao criar a conta. Tente novamente.');
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label>Confirme a Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;
