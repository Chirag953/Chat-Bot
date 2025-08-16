import React, { useEffect, useState } from 'react';
import { useNhostClient } from '@nhost/react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const nhost = useNhostClient();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email…');

  useEffect(() => {
    // Get the ticket from the URL query
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');

    if (!ticket) {
      setStatus('❌ No verification ticket found.');
      return;
    }

    // Call Nhost to verify the email
    nhost.auth.verifyEmail({ ticket })
      .then((res) => {
        if (res.isSuccess) {
          setStatus('✅ Email verified successfully! Redirecting…');
          // Tokens are automatically stored in local storage by Nhost
          setTimeout(() => {
            navigate('/auth'); // redirect user to login or home
          }, 2000); // wait 2 seconds so user sees the message
        } else {
          setStatus(`❌ Verification failed: ${res.error?.message || 'Invalid link'}`);
        }
      })
      .catch((err) => {
        console.error('Email verification error:', err);
        setStatus('❌ Unexpected error occurred during verification.');
      });
  }, [nhost, navigate]);

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p>{status}</p>
    </div>
  );
}
