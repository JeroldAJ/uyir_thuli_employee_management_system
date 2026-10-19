import { useCallback, useEffect, useState } from 'react'
import api, { getCurrentUser } from '../services/api.js'

function AttendancePage() {
  const canManage = ['Admin', 'HR'].includes(getCurrentUser()?.role)
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [status, setStatus] = useState('Present')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const loadRecords = useCallback(async () => {
    setError('')
    try {
      const { data } = await api.get('/attendance/')
      setRecords(data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Attendance records could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.get('/attendance/').then(({ data }) => {
      if (active) setRecords(data)
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.detail || 'Attendance records could not be loaded.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    if (canManage) {
      api.get('/employees/').then(({ data }) => {
        if (active) {
          setEmployees(data)
          setEmployeeId(data[0] ? String(data[0].id) : '')
        }
      }).catch((requestError) => {
        if (active) setError(requestError.response?.data?.detail || 'Employee list could not be loaded.')
      })
    }
    return () => { active = false }
  }, [canManage])

  async function submitAttendance(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.post('/attendance/', { date, status, ...(canManage ? { employee: Number(employeeId) } : {}) })
      setNotice('Attendance recorded.')
      await loadRecords()
    } catch (requestError) {
      const detail = requestError.response?.data
      setError(detail?.date?.[0] || detail?.detail || 'Attendance could not be recorded.')
    }
  }

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow mb-2">DAILY TRACKING</p><h1 className="h2 fw-semibold mb-1">Attendance</h1><p className="text-secondary mb-0">Record your attendance and review attendance history.</p></div></div>
      <form className="form-panel d-flex flex-wrap align-items-end gap-3 mb-4" onSubmit={submitAttendance}>
        <div><label className="form-label" htmlFor="attendance-date">Date</label><input className="form-control" id="attendance-date" onChange={(event) => setDate(event.target.value)} required type="date" value={date} /></div>
        <div><label className="form-label" htmlFor="attendance-status">Status</label><select className="form-select" id="attendance-status" onChange={(event) => setStatus(event.target.value)} value={status}><option>Present</option><option>Late</option><option>Absent</option></select></div>
        {canManage && <div><label className="form-label" htmlFor="attendance-employee">Employee</label><select className="form-select" id="attendance-employee" onChange={(event) => setEmployeeId(event.target.value)} required value={employeeId}><option value="">Choose employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</option>)}</select></div>}
        <button className="btn btn-success" type="submit">Save attendance</button>
      </form>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      <div className="table-panel table-responsive"><table className="table align-middle mb-0"><thead><tr><th>DATE</th><th>EMPLOYEE</th><th>STATUS</th></tr></thead><tbody>
        {loading ? <tr><td className="text-center py-4" colSpan="3">Loading attendance…</td></tr> : records.length === 0 ? <tr><td className="text-center py-4 text-secondary" colSpan="3">No attendance records yet.</td></tr> : records.map((record) => <tr key={record.id}><td>{record.date}</td><td>{record.employee_name}</td><td><span className="badge text-bg-light border">{record.status}</span></td></tr>)}
      </tbody></table></div>
    </section>
  )
}

export default AttendancePage
