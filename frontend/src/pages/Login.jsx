import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import toast from 'react-hot-toast'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  // const [error, setError] = useState(null) // Removed as toast handles errors
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    // setError(null) // Removed as toast handles errors
    const toastId = toast.loading("Logging in...")
    try {
      await login({ identifier, password })
      toast.success("Successfully logged in!", { id: toastId })
      navigate('/polls')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      // setError(msg) // Removed as toast handles errors
      toast.error(msg, { id: toastId })
    }
  }

  return (
    <div className="center-card">
      <h2 className="page-title">Login</h2>
      <div className="card">
        <form onSubmit={submit} className="form">
          <label>
            Identifier
            <input value={identifier} onChange={e => setIdentifier(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button className="btn primary">Sign in</button>
        </form>
      </div>
    </div>
  )
}
