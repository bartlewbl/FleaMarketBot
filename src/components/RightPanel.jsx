import { useState, useEffect, useCallback } from 'react';
import { sendInvite, getInvites, acceptInvite, declineInvite } from '../api';

export default function RightPanel({ collapsed, onToggle }) {
  const [inviteUsername, setInviteUsername] = useState('');
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState({ received: [], sent: [], friends: [] });
  const [loading, setLoading] = useState(false);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInvites();
      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
    const interval = setInterval(fetchInvites, 15000);
    return () => clearInterval(interval);
  }, [fetchInvites]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = inviteUsername.trim();
    if (!trimmed) return;
    setSendError(null);
    setSendSuccess(null);
    setSending(true);
    try {
      await sendInvite(trimmed);
      setSendSuccess(`Invite sent to ${trimmed}!`);
      setInviteUsername('');
      fetchInvites();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleAccept(id) {
    try {
      await acceptInvite(id);
      fetchInvites();
    } catch {
      // silent
    }
  }

  async function handleDecline(id) {
    try {
      await declineInvite(id);
      fetchInvites();
    } catch {
      // silent
    }
  }

  // Auto-clear messages
  useEffect(() => {
    if (sendSuccess) {
      const t = setTimeout(() => setSendSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [sendSuccess]);

  useEffect(() => {
    if (sendError) {
      const t = setTimeout(() => setSendError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [sendError]);

  return (
    <aside className={`right-panel ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="right-panel-toggle"
        type="button"
        aria-label="Toggle friends panel"
        onClick={onToggle}
      >
        {collapsed ? '<' : '>'}
      </button>

      <div className="right-panel-body">
        <div className="right-panel-heading">
          <div className="right-panel-title">Friends</div>
          <div className="right-panel-subtitle">Invite players to your party</div>
        </div>

        {/* Send Invite Form */}
        <form className="invite-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Username..."
            value={inviteUsername}
            onChange={e => { setInviteUsername(e.target.value); setSendError(null); }}
            className="invite-input"
            maxLength={20}
          />
          <button
            type="submit"
            className="invite-send-btn"
            disabled={sending || !inviteUsername.trim()}
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>

        {sendError && <div className="invite-error">{sendError}</div>}
        {sendSuccess && <div className="invite-success">{sendSuccess}</div>}

        {/* Received Invites */}
        {data.received.length > 0 && (
          <div className="invite-section">
            <div className="invite-section-title">Pending Requests</div>
            <div className="invite-list">
              {data.received.map(inv => (
                <div key={inv.id} className="invite-card invite-card-received">
                  <div className="invite-card-name">{inv.from_username}</div>
                  <div className="invite-card-actions">
                    <button
                      className="invite-accept-btn"
                      onClick={() => handleAccept(inv.id)}
                      title="Accept"
                    >
                      +
                    </button>
                    <button
                      className="invite-decline-btn"
                      onClick={() => handleDecline(inv.id)}
                      title="Decline"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Invites */}
        {data.sent.length > 0 && (
          <div className="invite-section">
            <div className="invite-section-title">Sent Invites</div>
            <div className="invite-list">
              {data.sent.map(inv => (
                <div key={inv.id} className="invite-card invite-card-sent">
                  <div className="invite-card-name">{inv.to_username}</div>
                  <div className="invite-card-status">Pending</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="invite-section">
          <div className="invite-section-title">
            Friends{data.friends.length > 0 ? ` (${data.friends.length})` : ''}
          </div>
          {data.friends.length === 0 ? (
            <div className="invite-empty">
              No friends yet. Send an invite!
            </div>
          ) : (
            <div className="invite-list">
              {data.friends.map(f => (
                <div key={f.user_id} className="invite-card invite-card-friend">
                  <div className="invite-friend-dot" />
                  <div className="invite-card-name">{f.username}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
