// src/pages/VerifyEmail.js
import React, { useEffect } from 'react';
import { useNhostClient } from '@nhost/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
  const nhost = useNhostClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState('Verifying your email…');

  useEffect(() => {
    const verifyEmail = async () => {
      // Get ticket from URL parameters
      const ticket = searchParams.get('ticket');
      const refreshToken = searchParams.get('refreshToken');
      
      if (!ticket) {
        setStatus('❌ No verification ticket found in URL.');
        return;
      }

      try {
        const result = await nhost.auth.verifyEmail({ ticket });
        
        if (result.isSuccess) {
          setStatus('✅ Email verified successfully! Redirecting…');
          setTimeout(() => navigate('/'), 2000);
        } else {
          setStatus(`❌ Verification failed: ${result.error?.message || 'Invalid ticket'}`);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('❌ Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [nhost, navigate, searchParams]);

  return (
    <div style={{ 
      padding: 24, 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(45deg, #0A0A0A, #15151A)'
    }}>
      <div style={{
        padding: '40px',
        borderRadius: '15px',
        backgroundColor: 'rgba(25, 25, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '1rem', 
          fontSize: '2rem', 
          color: '#D4D4D4' 
        }}>
          Email Verification
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{status}</p>
        
        {status.includes('❌') && (
          <button 
            onClick={() => navigate('/auth')} 
            style={{ 
              padding: '12px 25px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4dabf7',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}