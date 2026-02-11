import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { token, role, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="header">
      <div className="brand">
        <Link to="/polls" className="brand-link">MannKiBaat</Link>
      </div>
      <div className="header-actions">
        {token ? (
          <>
            <span className="role-pill">{role}</span>
            {role === 'coordinator' && (
              <>
                <Link to="/create" className="btn small secondary">New Poll</Link>
                <Link to="/create-student" className="btn small secondary">New Student</Link>
              </>
            )}
            <button className="btn outlined" onClick={logout}>Logout</button>
          </>
        ) : (
          location.pathname !== '/login' && <Link to="/login" className="btn">Login</Link>
        )}
      </div>
    </header>
  )
}
