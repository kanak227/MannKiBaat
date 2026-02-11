import React, { useEffect, useState } from 'react'
import api from '../api'
import './polls.css'
import Modal from '../components/Modal'
import PollDetails from './PollDetails'

import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Polls() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPollId, setSelectedPollId] = useState(null)
  const { token } = useAuth()

  const fetchPolls = () => {
    if (!token) {
      console.log("Fetch skipped: No token")
      return
    }
    console.log("Fetching polls with token:", token.substring(0, 10) + "...")
    console.log("Auth Header:", api.defaults.headers.common['Authorization'])

    api.get('/poll/getAllPolls').then(res => {
      console.log("Fetch success")
      setPolls(res.data.polls || [])
    }).catch((err) => {
      console.error("Fetch failed:", err)
      if (err.response?.status !== 401) {
        toast.error('Failed to fetch polls')
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (token) fetchPolls()
    else setLoading(false)
  }, [token])

  const handleVoteSuccess = () => {
    setSelectedPollId(null)
    fetchPolls()
  }

  if (loading) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <h2 className="title">Polls</h2>
      <ul className="poll-list">
        {polls.map(p => (
          <li
            key={p._id}
            className={`poll-item ${p.hasVoted ? 'voted' : ''}`}
            onClick={() => !p.hasVoted && setSelectedPollId(p._id)}
            style={{ cursor: p.hasVoted ? 'default' : 'pointer', opacity: 1 }}
          >
            <div
              className="poll-link"
              style={p.hasVoted && p.showResults && p.results ? { flexDirection: 'column', alignItems: 'stretch' } : {}}
            >
              <div className="question">{p.question}</div>

              {/* Show results if voted and enabled */}
              {p.hasVoted && p.showResults && p.results ? (
                <div className="poll-results-preview" style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {p.results.map((r, idx) => {
                    const totalVotes = p.results.reduce((acc, curr) => acc + curr.votes, 0)
                    const percentage = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0

                    return (
                      <div key={idx} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                          <span>{r.option}</span>
                          <span style={{ opacity: 0.9, fontWeight: '500' }}>{Math.round(percentage)}%</span>
                        </div>
                        <div style={{
                          background: 'rgba(255,255,255,0.1)',
                          height: '8px',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            background: 'var(--secondary)',
                            height: '100%',
                            transition: 'width 0.5s ease'
                          }}></div>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '10px', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                    Total Votes: {p.results.reduce((acc, curr) => acc + curr.votes, 0)}
                  </div>
                </div>
              ) : (
                <div className="meta">
                  {p.hasVoted ? (
                    <span className="status-badge voted">Voted</span>
                  ) : (
                    <span className={`status-badge ${p.isActive ? 'active' : 'closed'}`}>
                      {p.isActive ? 'Open' : 'Closed'}
                    </span>
                  )}
                  {p.hasVoted && !p.showResults && <span style={{ marginLeft: '10px', opacity: 0.6, fontSize: '0.85rem' }}>Results hidden</span>}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={!!selectedPollId}
        onClose={() => setSelectedPollId(null)}
        title="Poll Details"
      >
        {selectedPollId && (
          <PollDetails
            pollId={selectedPollId}
            onVoteSuccess={handleVoteSuccess}
          />
        )}
      </Modal>
    </div>
  )
}
