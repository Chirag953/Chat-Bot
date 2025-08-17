import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticationStatus } from '@nhost/react';
import Auth from './auth/Auth';
import ChatList from './components/ChatList';
import ChatView from './components/ChatView';
import VerifyEmail from './pages/VerifyEmail';

function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  
  if (isLoading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <ChatList />
          </AuthGuard>
        }
      />
      <Route
        path="/chats/:chatId"
        element={
          <AuthGuard>
            <ChatView />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}