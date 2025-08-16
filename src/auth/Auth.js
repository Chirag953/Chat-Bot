import React, { useState } from 'react';
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Make sure this path is correct relative to this file

export default function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busyMessage, setBusyMessage] = useState(''); // optional inline feedback

  const { signInEmailPassword, isLoading: signingIn } = useSignInEmailPassword();
  const { signUpEmailPassword, isLoading: signingUp } = useSignUpEmailPassword();

  async function onSubmit(e) {
    e.preventDefault();
    setBusyMessage('');

    // simple client-side validation
    if (!email.trim() || !password.trim()) {
      return alert('Please enter email and password.');
    }

    try {
      if (mode === 'signin') {
        setBusyMessage('Signing in…');
        const result = await signInEmailPassword(email, password);

        if (!result?.isSuccess) {
          // detailed message if available
          return alert(result?.error?.message || 'Unable to sign in. Please check credentials.');
        }

        // successful sign in
        nav('/');
      } else {
        setBusyMessage('Creating account…');
        const result = await signUpEmailPassword(email, password);

        // Nhost returns a result object. If verification is enabled the user exists but isn't signed in.
        if (!result) {
          return alert('Unable to create account. Please try again.');
        }

        // If there is an error field, show appropriate message.
        if (!result.isSuccess && result.error) {
          // If user created but not verified, Nhost may return an error but also create the user.
          // We treat created-but-unverified as success message.
          if (result.user) {
            alert(
              'Account created successfully. A verification email has been sent to your inbox. ' +
                'If you don’t see it, please check your Spam/Promotions folder. Then sign in.'
            );
            setMode('signin');
            return;
          }
          return alert(result.error.message || 'Unable to create account. Please try again.');
        }

        // success path (user created)
        alert(
          '✅ Account created successfully!\n\n📧 A verification email has been sent to your inbox.\n' +
            'If you don’t see it, please check your Spam or Promotions folder.\n\nOnce verified, you can sign in.'
        );
        setMode('signin');
      }
    } catch (err) {
      // unexpected runtime/network error
      console.error('Auth error', err);
      alert('An unexpected error occurred. Check console for details.');
    } finally {
      setBusyMessage('');
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">ChatApp</div>

        <h2 className="title">{mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}</h2>

        <form onSubmit={onSubmit} className="auth-form" autoComplete="off">
          <label className="field">
            <span className="label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
              className="input"
            />
          </label>

          {busyMessage && <div className="busy">{busyMessage}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={signingIn || signingUp}
          >
            {signingIn || signingUp
              ? mode === 'signin'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'signin'
              ? 'Sign In'
              : 'Sign Up'}
          </button>
        </form>

        <div className="foot">
          <span className="foot-text">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            type="button"               // IMPORTANT: prevent accidental form submission
            className="link-btn"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
