import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubscription, useMutation } from '@apollo/client';
import { GET_MESSAGES_SUB, INSERT_MESSAGE, SEND_MESSAGE_ACTION } from '../graphql/queries';
import { useUserData, useSignOut, useNhostClient } from '@nhost/react';
import './ChatView.css';

export default function ChatView() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const user = useUserData();
  const signOutHook = useSignOut();
  const nhost = useNhostClient();

  const { data, loading } = useSubscription(GET_MESSAGES_SUB, {
    variables: { chat_id: chatId },
    skip: !chatId,
    fetchPolicy: 'no-cache',
  });

  const [insertMessage] = useMutation(INSERT_MESSAGE);
  const [sendAction] = useMutation(SEND_MESSAGE_ACTION);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const t = setTimeout(() => { listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
    return () => clearTimeout(t);
  }, [data]);

  async function onSend(e) {
    e.preventDefault();
    const body = (text || '').trim();
    if (!body) return;

    setSending(true);
    try {
      await insertMessage({ variables: { chat_id: chatId, message: body, is_bot: false } });

      const res = await sendAction({
        variables: { chat_id: chatId, message: body },
        errorPolicy: 'all',
      });

      if (res?.errors && res.errors.length) {
        console.warn('sendAction GraphQL errors (non-fatal):', res.errors);
      }
    } catch (networkErr) {
      console.error('sendAction network error:', networkErr);
    } finally {
      setText('');
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleSignOut() {
    try {
      if (typeof signOutHook === 'function') {
        await signOutHook();
      } else if (signOutHook && typeof signOutHook.signOut === 'function') {
        await signOutHook.signOut();
      } else if (nhost && nhost.auth && typeof nhost.auth.signOut === 'function') {
        await nhost.auth.signOut();
      } else {
        throw new Error('signOut not available');
      }
      navigate('/auth');
    } catch (err) {
      console.error('Sign out failed', err);
      alert('Sign out failed. Try again.');
    }
  }

  const messages = (data?.messages || []).slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div className="chatview-wrap">
      <div className="chatview-card">
        <header className="chatview-header">
          <div>
            <div className="app-title-small">ChatApp</div>
            <div className="chat-title">Conversation</div>
          </div>
          <div className="header-right">
            <div className="user-email-small">{user?.email || 'Not signed in'}</div>
            <button className="signout-btn-small" onClick={handleSignOut}>Sign out</button>
          </div>
        </header>

        <div ref={listRef} className="messages-container">
          {loading && <div className="loading-msg">Loading messages…</div>}
          {!loading && messages.length === 0 && <div className="empty-messages">No messages yet — start the conversation.</div>}
          {messages.map((m) => (
            <div key={m.id} className={`message-row ${m.is_bot ? 'bot' : 'user'}`}>
              <div className={`message-bubble ${m.is_bot ? 'bot-bubble' : 'user-bubble'}`}>
                <div className="message-text">{m.message}</div>
                <div className="message-time">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
              </div>
            </div>
          ))}
        </div>

        <form className="send-form" onSubmit={onSend}>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="send-input"
            disabled={sending}
            autoComplete="off"
          />
          <button className="send-btn" type="submit" disabled={sending || !text.trim()}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
