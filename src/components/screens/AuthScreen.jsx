import { useState } from 'react';

export default function AuthScreen({ onLogin, onRegister, error, loading }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (isRegister) {
      onRegister(username, password);
    } else {
      onLogin(username, password);
    }
  }

  return (
    <div className="screen auth-screen">
      <h1 className="title">PIXEL GRIND</h1>
      <h2 className="auth-subtitle">{isRegister ? 'Create Account' : 'Login'}</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="auth-input"
          maxLength={20}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="auth-input"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" className="btn" disabled={loading || !username || !password}>
          {loading ? '...' : (isRegister ? 'Register' : 'Login')}
        </button>
      </form>

      <button
        className="btn btn-small"
        onClick={() => { setIsRegister(!isRegister); }}
      >
        {isRegister ? 'Have an account? Login' : 'New? Register'}
      </button>
    </div>
  );
}
