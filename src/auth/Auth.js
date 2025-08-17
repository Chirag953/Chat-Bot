import React, { useState, useEffect } from 'react';
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busyMessage, setBusyMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  // const [errorMessage, setErrorMessage] = useState('');

  const { signInEmailPassword, isLoading: signingIn } = useSignInEmailPassword();
  const { signUpEmailPassword, isLoading: signingUp } = useSignUpEmailPassword();

  // Clean up verification data on auth page
  useEffect(() => {
    localStorage.removeItem('verification_ticket');
    localStorage.removeItem('verification_refreshToken');
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setBusyMessage('');
    // setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      // return setErrorMessage('Please enter both email and password.');
    }

    try {
      if (mode === 'signin') {
        setBusyMessage('Signing in…');
        const result = await signInEmailPassword(email, password);

        if (!result?.isSuccess) {
          // const errorMsg = result?.error?.message || 'Unable to sign in. Please check credentials.';
          // return setErrorMessage(errorMsg);
        }
        nav('/');
      } else {
        setBusyMessage('');
        const result = await signUpEmailPassword(email, password);

        // Log result for debugging
        console.log('SignUp Result:', result);
        
        // Successful signup
        if (result.isSuccess) {
          setShowSuccess(true);
          alert(`✅ Account created successfully!\n\n📧 A verification email has been sent to your inbox.\nIf you don’t see it, please check your Spam or Promotions folder.\n\nOnce verified, you can sign in.`);
          return;
        }
        setShowSuccess(true);
        // User created but needs verification
        if (result.error?.message?.includes('email needs to be verified') && result.user) {
          setShowSuccess(true);
          
          return;
        }
        
        // // Handle other errors
        // if (result.error) {
        //   return setErrorMessage(result.error.message || 'Unable to create account. Please try again.');
        // }
        
        // Fallback error
        // return setErrorMessage('An unexpected error occurred during signup.');
      }
    } catch (err) {
      console.error('Auth error', err);
    //   setErrorMessage('An unexpected error occurred. Please try again.');
    // } finally {
      if (mode !== 'signup' || !showSuccess) {
        setBusyMessage('');
      }
    }
  }

  // Render success UI
  if (showSuccess && mode === 'signup') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo">ChatApp</div>
          
          <div style={{ 
            textAlign: 'center',
            padding: '20px 0',
            animation: 'fadeIn 1s ease-out'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#4dabf7' }}>✓</div>
            <h2 style={{ marginBottom: '1rem' }}>Verification Email Sent!</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We've sent a verification email to <strong>{email}</strong>.
              Please check your inbox and follow the instructions to verify your account.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#8B8B8D', marginBottom: '2rem' }}>
              <strong>Note:</strong> If you don't see the email, check your spam folder.
            </p>
            <button
              className="submit-btn"
              onClick={() => {
                setMode('signin');
                setShowSuccess(false);
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Render normal auth form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo">ChatApp</div>

        <h2 className="title">{mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}</h2>
        {/* {errorMessage && <div className="error-message">{errorMessage}</div>} */}
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
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setShowSuccess(false);
            }}
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}