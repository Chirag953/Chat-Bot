import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHATS, CREATE_CHAT } from '../graphql/queries';
import { useUserData, useSignOut, useNhostClient } from '@nhost/react';
import { Link, useNavigate } from 'react-router-dom';
import './ChatList.css';

export default function ChatList() {
  const user = useUserData();
  const userId = user?.id || null;
  const signOutHook = useSignOut();       // may be a function or an object depending on version
  const nhost = useNhostClient();         // reliable fallback
  const nav = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userId) {
      refetch().catch(() => {});
    }
  }, [userId, refetch]);

  async function onCreate(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return alert('Please enter a chat title.');
    if (!userId) return alert('You must be signed in to create a chat.');

    setBusy(true);
    try {
      const res = await createChat({
        variables: { user_id: userId, title: trimmed },
      });

      const chatId = res?.data?.insert_chats_one?.id;
      setTitle('');
      if (chatId) nav(`/chats/${chatId}`);
      else {
        console.warn('createChat response', res);
        alert('Chat created but server returned an unexpected response. Check console.');
      }
    } catch (err) {
      console.error('createChat error', err);
      alert(err?.message || 'Failed to create chat. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      // Try the hook first if it's a function
      if (typeof signOutHook === 'function') {
        await signOutHook();
      } else if (signOutHook && typeof signOutHook.signOut === 'function') {
        // some versions return an object with signOut()
        await signOutHook.signOut();
      } else if (nhost && nhost.auth && typeof nhost.auth.signOut === 'function') {
        // fallback to the nhost client
        await nhost.auth.signOut();
      } else {
        throw new Error('signOut not available');
      }
      nav('/auth');
    } catch (err) {
      console.error('Sign out failed', err);
      alert('Sign out failed. Try again.');
    }
  }

  return (
    <div className="chatlist-wrapper">
      <div className="chatlist-card">
        <div className="chatlist-header">
          <div>
            <div className="app-title">ChatApp</div>
            <div className="subtitle">Your conversations</div>
          </div>

          <div className="user-area">
            <div className="user-email">{user?.email || 'Not signed in'}</div>
            <button className="signout-btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>

        <form className="create-form" onSubmit={onCreate}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New chat title"
            className="create-input"
            disabled={!userId || creating || busy}
          />
          <button
            type="submit"
            className="create-btn"
            disabled={!userId || creating || busy}
          >
            {creating || busy ? 'Creating...' : 'Create'}
          </button>
        </form>

        <section className="chats-section">
          {loading && (
            <div className="loading-placeholder">
              <div className="shimmer-line" />
              <div className="shimmer-line short" />
            </div>
          )}

          {error && (
            <div className="error-box">
              <strong>Error loading chats.</strong>
              <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {String(error.message)}
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {data?.chats?.length ? (
                <ul className="chats-list">
                  {data.chats.map((c) => (
                    <li key={c.id} className="chat-item">
                      <Link to={`/chats/${c.id}`} className="chat-link">
                        <div className="chat-title">{c.title || 'Untitled'}</div>
                        <div className="chat-meta">
                          {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-box">
                  <p>No chats yet — create one above to get started.</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
