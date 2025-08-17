// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NhostClient, NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
const NHOST_SUBDOMAIN = 'vmtocoayfeepqjvmjjev';
const NHOST_REGION = 'ap-south-1';


const nhost = new NhostClient({
  subdomain: NHOST_SUBDOMAIN,
  region: NHOST_REGION,
  autoRefreshToken: false,
  autoSignIn: false, 
});

nhost.auth.onAuthStateChanged((event, session) => {
  if (event === 'VERIFICATION_REQUESTED') {
    const ticket = session?.verificationTicket;
    if (ticket) {
      localStorage.setItem('verification_ticket', ticket);
      console.log('Stored verification ticket:', ticket);
    }
  }
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <BrowserRouter>
          <Suspense fallback={<div>Loading app…</div>}>
            <App />
          </Suspense>
        </BrowserRouter>
      </NhostApolloProvider>
    </NhostProvider>
  </React.StrictMode>
);
