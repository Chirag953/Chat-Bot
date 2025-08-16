import { useEffect, useState } from 'react';
import { useNhostClient } from '@nhost/react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const nhost = useNhostClient();
  const [status, setStatus] = useState('Verifying…');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');

    if (!ticket) {
      setStatus('❌ No verification ticket found.');
      return;
    }

    nhost.auth.verifyEmail({ ticket })
      .then(res => {
        if (res.isSuccess) {
          setStatus('✅ Email verified successfully!');
          setTimeout(() => navigate('/auth'), 2000); // redirect to login
        } else {
          setStatus(`❌ Verification failed: ${res.error?.message}`);
        }
      })
      .catch(err => setStatus(`❌ Error: ${err.message}`));
  }, [nhost, navigate]);

  return <div style={{ padding: 24, textAlign: 'center' }}>{status}</div>;
}
