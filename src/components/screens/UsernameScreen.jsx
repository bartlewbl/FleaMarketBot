import { useState } from 'react';

export default function UsernameScreen({ onSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 16) {
      setError('Name must be 16 characters or less');
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="screen username-screen">
      <div className="username-title">PIXEL GRIND</div>
      <div className="username-subtitle">Name Your Hero</div>
      <div className="username-desc">
        Choose a name that will be known across the land.
      </div>

      <form className="username-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter hero name..."
          value={name}
          onChange={e => { setName(e.target.value); setError(null); }}
          className="auth-input"
          maxLength={16}
          autoFocus
        />
        {error && <div className="auth-error">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={!name.trim()}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
