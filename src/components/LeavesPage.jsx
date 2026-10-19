import { useCallback, useEffect, useState } from 'react'
import api, { getCurrentUser } from '../services/api.js'

function LeavesPage() {
  const user = getCurrentUser()
  const canReview = ['Admin', 'HR'].includes(user?.role)
  const [leaves, setLeaves] = useState([])
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const loadLeaves = useCallback(async () => {
    setError('')
    try {
      const { data } = await api.get('/leaves/')
      setLeaves(data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Leave requests could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.get('/leaves/').then(({ data }) => {
      if (active) setLeaves(data)
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.detail || 'Leave requests could not be loaded.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function requestLeave(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.post('/leaves/', form)
      setForm({ start_date: '', end_date: '', reason: '' })
      setNotice('Leave request submitted.')
      await loadLeaves()
    } catch (requestError) {
      const data = requestError.response?.data
      setError(data?.end_date?.[0] || data?.detail || 'Leave request could not be submitted.')
    }
  }

  async function updateStatus(leave, status) {
    setError('')
    setNotice('')
    try {
      await api.patch(`/leaves/${leave.id}/`, { status })
      setLeaves((current) => current.map((item) => item.id === leave.id ? { ...item, status } : item))
      setNotice(`Request ${status.toLowerCase()}.`)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Leave request could not be updated.')
    }
  }

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow mb-2">TIME OFF</p><h1 className="h2 fw-semibold mb-1">Leave requests</h1><p className="text-secondary mb-0">{canReview ? 'Review and manage employee time off.' : 'Submit time off and track your request status.'}</p></div></div>
      {!canReview && <form className="form-panel row g-3 mb-4" onSubmit={requestLeave}>
        <div className="col-12"><h2 className="h5 mb-0">Request leave</h2></div>
        <div className="col-12 col-sm-6"><label className="form-label" htmlFor="leave-start">Start date</label><input className="form-control" id="leave-start" min={new Date().toISOString().slice(0, 10)} onChange={(event) => setForm({ ...form, start_date: event.target.value })} required type="date" value={form.start_date} /></div>
        <div className="col-12 col-sm-6"><label className="form-label" htmlFor="leave-end">End date</label><input className="form-control" id="leave-end" min={form.start_date || new Date().toISOString().slice(0, 10)} onChange={(event) => setForm({ ...form, end_date: event.target.value })} required type="date" value={form.end_date} /></div>
        <div className="col-12"><label className="form-label" htmlFor="leave-reason">Reason</label><textarea className="form-control" id="leave-reason" onChange={(event) => setForm({ ...form, reason: event.target.value })} required rows="3" value={form.reason} /></div>
        <div className="col-12"><button className="btn btn-success" type="submit">Submit request</button></div>
      </form>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      <div className="table-panel table-responsive"><table className="table align-middle mb-0"><thead><tr><th>EMPLOYEE</th><th>DATES</th><th>REASON</th><th>STATUS</th>{canReview && <th>ACTIONS</th>}</tr></thead><tbody>
        {loading ? <tr><td className="text-center py-4" colSpan={canReview ? 5 : 4}>Loading requests…</td></tr> : leaves.length === 0 ? <tr><td className="text-center py-4 text-secondary" colSpan={canReview ? 5 : 4}>No leave requests found.</td></tr> : leaves.map((leave) => <tr key={leave.id}><td>{leave.employee_name}</td><td>{leave.start_date} – {leave.end_date}</td><td className="leave-reason">{leave.reason}</td><td><span className={`badge ${leave.status === 'Approved' ? 'text-bg-success' : leave.status === 'Rejected' ? 'text-bg-danger' : 'text-bg-warning'}`}>{leave.status}</span></td>{canReview && <td>{leave.status === 'Pending' ? <div className="d-flex gap-2"><button className="btn btn-sm btn-outline-success" onClick={() => updateStatus(leave, 'Approved')} type="button">Approve</button><button className="btn btn-sm btn-outline-danger" onClick={() => updateStatus(leave, 'Rejected')} type="button">Reject</button></div> : '—'}</td>}</tr>)}
      </tbody></table></div>
    </section>
  )
}

export default LeavesPage
