import { useState } from 'react';
import axios from 'axios';
import '../css/LoginPage.css'
import { Link } from "react-router-dom";




const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email,
        password
      });
      
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);

      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError('Неверный email или пароль');
    }
  };

  return (
    <main>
      <div className="login-container">
        <h2 className='login-title-enter'>Вход в систему</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="login-input-container" onSubmit={handleLogin}>
          <h3>Введите логин</h3>
          <input  
            className='login-input-field'
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        <h3>Введите пароль</h3>
          <input
            className='login-input-field'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
          />
          <div className='login-button-container'>
            <button className='login-button' type="submit">Войти</button>
            <button className='login-button'><Link className='card-button-link' to='/register'>Зарегистрироваться</Link> </button>
          </div>
          <button className='login-button password-reset-button'>Забыли пароль?</button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;