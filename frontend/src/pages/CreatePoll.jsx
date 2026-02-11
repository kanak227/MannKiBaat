import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import './CreatePoll.css'
import toast from 'react-hot-toast'

export default function CreatePoll() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  // const [error, setError] = useState(null)
  const navigate = useNavigate()

  const updateOption = (i, v) => {
    const copy = [...options]
    copy[i] = v
    setOptions(copy)
  }

  const addOption = () => setOptions(prev => [...prev, ''])
  const removeOption = (i) => setOptions(prev => prev.filter((_, idx) => idx !== i))

  const submit = async (e) => {
    e.preventDefault()
    // setError(null)

    const promise = api.post('/poll/create', { question, options: options.filter(Boolean) })

    toast.promise(promise, {
      loading: 'Creating poll...',
      success: 'Poll created successfully!',
      error: (err) => err.response?.data?.message || 'Failed to create poll'
    })

    try {
      await promise
      navigate('/polls')
    } catch (err) {
      // setError(err.response?.data?.message || 'Failed to create')
    }
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Create Poll</h2>
      <div className="card">
        <form onSubmit={submit} className="form">
          <label>
            Question
            <input value={question} onChange={e => setQuestion(e.target.value)} />
          </label>

          <div className="options-section">
            <h3>Options</h3>
            <div className="options-editor">
              {options.map((opt, idx) => (
                <div key={idx} className="option-row">
                  <input
                    value={opt}
                    onChange={e => updateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-icon remove-option"
                    onClick={() => removeOption(idx)}
                    title="Remove option"
                    disabled={options.length <= 2}
                    style={{ visibility: options.length <= 2 ? 'hidden' : 'visible' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              <button type="button" className="btn secondary full-width" onClick={addOption}>
                + Add Option
              </button>
            </div>
          </div>

          <button className="btn primary">Create</button>
        </form>
      </div>
    </div>
  )
}
