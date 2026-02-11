import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Polls from './pages/Polls'
import CreatePoll from './pages/CreatePoll'
import CreateStudent from './pages/CreateStudent'
import Header from './components/Header'
import { useAuth } from './contexts/AuthContext'
import CoordinatorRoute from './components/CoordinatorRoute'

import { Toaster } from 'react-hot-toast'

export default function App() {
  const { token } = useAuth()

  return (
    <div className="app-root">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#2ed573',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4757',
              secondary: '#fff',
            },
          },
        }}
      />
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/polls" replace /> : <Login />} />
          <Route path="/login" element={<Login />} />

          {/* Public Routes (Authenticated) */}
          <Route path="/polls" element={token ? <Polls /> : <Navigate to="/login" replace />} />

          {/* Protected Routes (Coordinator Only) */}
          <Route element={<CoordinatorRoute />}>
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/create-student" element={<CreateStudent />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
