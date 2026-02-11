import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import './polls.css'
import toast from 'react-hot-toast'

export default function PollDetails({ pollId, onVoteSuccess }) {
  const params = useParams()
  const id = pollId || params.id
  const [poll, setPoll] = useState(null)
  const [selected, setSelected] = useState(null)
  const { role } = useAuth()

  const fetchPollData = async () => {
    try {
      const res = await api.get(`/poll/${id}`)
      const pollData = res.data.poll
      setPoll(pollData)

      if (role === 'coordinator' || (role === 'student' && pollData.showResults)) {
        try {
          const resultsRes = await api.get(`/poll/${id}/results`)
          setPoll(prev => ({ ...prev, results: resultsRes.data.results }))
        } catch (e) {
          console.error('Failed to fetch results', e)
        }
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to load poll details')
    }
  }

  useEffect(() => {
    if (id) fetchPollData()
  }, [id, role])

  const submitVote = async () => {
    const promise = api.post(`/votes/${id}`, { optionIndex: selected })

    toast.promise(promise, {
      loading: 'Casting vote...',
      success: 'Vote cast successfully!',
      error: (err) => err.response?.data?.message || 'Failed to cast vote'
    })

    try {
      await promise
      if (onVoteSuccess) {
        setTimeout(onVoteSuccess, 1000)
      }
      fetchPollData()
    } catch (err) { }
  }

  const handleClosePoll = async () => {
    if (!window.confirm("Are you sure you want to close this poll? This action cannot be undone.")) return
    const promise = api.post(`/poll/${id}/close`)
    toast.promise(promise, {
      loading: 'Closing poll...',
      success: 'Poll closed successfully',
      error: 'Failed to close poll'
    })
    try {
      await promise
      fetchPollData()
      if (onVoteSuccess) setTimeout(onVoteSuccess, 500)
    } catch (e) { }
  }

  const handleToggleResults = async () => {
    const promise = api.post(`/poll/${id}/toggle-results`)
    toast.promise(promise, {
      loading: 'Toggling results...',
      success: 'Results visibility updated',
      error: 'Failed to update visibility'
    })
    try {
      const res = await promise
      setPoll(prev => ({ ...prev, showResults: res.data.showResults }))
    } catch (e) { }
  }

  if (!poll) return <div className="card-loader">Loading...</div>

  const getVoteCount = (optionText) => {
    if (!poll.results) return 0
    const optionResult = poll.results.find(r => r.option === optionText)
    return optionResult ? optionResult.votes : 0
  }

  const getTotalVotes = () => {
    if (!poll.results) return 0
    return poll.results.reduce((acc, curr) => acc + curr.votes, 0)
  }

  const getPercentage = (optionText) => {
    const total = getTotalVotes()
    if (total === 0) return 0
    const count = getVoteCount(optionText)
    return (count / total) * 100
  }

  const showStats = role === 'coordinator' || (role === 'student' && poll.showResults && poll.results)
  const isStudent = role === 'student'
  const canVote = isStudent && poll.isActive && !poll.hasVoted

  console.log("PollDetails Debug:", {
    role,
    showResults: poll.showResults,
    hasResults: !!poll.results,
    showStats,
    isStudent
  })

  return (
    <div className="poll-details-container">
      <h2 className="poll-question">{poll.question}</h2>

      <div className="options">
        {poll.options.map((opt, idx) => {
          const percentage = showStats ? getPercentage(opt.text) : 0

          return (
            <div key={idx} className={`option-wrapper ${selected === idx ? 'selected-wrapper' : ''}`} onClick={() => {
              if (canVote) setSelected(idx)
            }}>
              <div className={`option ${selected === idx ? 'selected' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Coordinator Progress Bar Overlay */}
                {role === 'coordinator' && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${percentage}%`,
                      backgroundColor: 'rgba(46, 213, 115, 0.2)',
                      transition: 'width 0.5s ease',
                      zIndex: 0
                    }}
                  />
                )}

                <div className="option-content" style={{ zIndex: 1, position: 'relative', display: 'flex', alignItems: 'center', width: '100%', padding: '10px' }}>
                  {isStudent && (
                    <input
                      type="radio"
                      name="opt"
                      checked={selected === idx}
                      onChange={() => setSelected(idx)}
                      disabled={!canVote}
                      style={{ marginRight: '10px' }}
                    />
                  )}
                  <span className="option-text">{opt.text}</span>

                  {role === 'coordinator' && (
                    <span className="vote-stat" style={{ marginLeft: 'auto' }}>
                      {Math.round(percentage)}% ({getVoteCount(opt.text)})
                    </span>
                  )}
                </div>
              </div>

              {/* Student Results View - Below option */}
              {isStudent && showStats && (
                <div className="student-stats-container" style={{ marginTop: '5px', paddingLeft: '34px', marginBottom: '15px' }}>
                  <div className="progress-bar-bg" style={{
                    background: 'rgba(255,255,255,0.1)',
                    height: '6px',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '4px',
                    width: '100%'
                  }}>
                    <div className="progress-bar-fill" style={{
                      width: `${percentage}%`,
                      background: 'var(--secondary)',
                      height: '100%',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <div className="stats-text" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                    {Math.round(percentage)}% ({getVoteCount(opt.text)} votes)
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="actions-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {role === 'coordinator' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn small secondary" onClick={handleToggleResults}>
              {poll.showResults ? 'Hide Results' : 'Show Results'}
            </button>
            {poll.isActive ? (
              <button className="btn small danger" onClick={handleClosePoll}>Close Poll</button>
            ) : (
              <span className="status-badge closed" style={{ padding: '8px 12px', background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', borderRadius: '6px' }}>Closed</span>
            )}
          </div>
        )}

        {canVote && (
          <button className="btn primary" onClick={submitVote} disabled={selected === null}>Vote</button>
        )}

        {isStudent && poll.hasVoted && (
          <div className="meta" style={{ color: 'var(--secondary)' }}>You have voted</div>
        )}

        {!poll.isActive && isStudent && <div className="meta">This poll is closed</div>}
      </div>
    </div>
  )
}
