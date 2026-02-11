import React, { useState } from 'react'
import api from '../api'
import './CreatePoll.css'
import toast from 'react-hot-toast'

export default function CreateStudent() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const submit = async (e) => {
        e.preventDefault()

        const promise = api.post('/auth/create-user', { identifier, password, name, role: 'student' })

        toast.promise(promise, {
            loading: 'Registering student...',
            success: 'Student created successfully!',
            error: (err) => err.response?.data?.message || 'Failed to create student'
        })

        try {
            await promise
            setIdentifier('')
            setPassword('')
            setName('')
        } catch (err) {
            // Error handled by toast
        }
    }

    return (
        <div className="center-card">
            <h2 className="page-title">Create Student</h2>
            <div className="card">
                <form onSubmit={submit} className="form">
                    <label>
                        Name
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
                    </label>
                    <label>
                        Identifier (e.g., Roll No.)
                        <input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Unique Identifier" required />
                    </label>
                    <label>
                        Password
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </label>

                    <button className="btn primary">Register Student</button>
                </form>
            </div>
        </div>
    )
}
