import { useCallback, useEffect, useState } from 'react'
import api from '../services/api.js'

const initialForm = { email: '', password: '', first_name: '', last_name: '', phone: '', department: '', designation: '', date_of_joining: '' }

function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const loadEmployees = useCallback(async () => {
    setError('')
    try {
      const { data } = await api.get('/employees/')
      setEmployees(data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Employee records could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    api.get('/employees/').then(({ data }) => {
      if (active) setEmployees(data)
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.detail || 'Employee records could not be loaded.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function addEmployee(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await api.post('/employees/', form)
      setForm(initialForm)
      setNotice('Employee added successfully.')
      await loadEmployees()
      setFormOpen(false)
    } catch (requestError) {
      const payload = requestError.response?.data
      setError(payload && typeof payload === 'object' ? Object.entries(payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`).join(' ') : 'Employee could not be added.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Delete ${employee.first_name} ${employee.last_name}? This cannot be undone.`)) return
    setError('')
    setNotice('')
    try {
      await api.delete(`/employees/${employee.id}/`)
      setEmployees((current) => current.filter((item) => item.id !== employee.id))
      setNotice('Employee deleted.')
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Employee could not be deleted.')
    }
  }

  return (
    <section>
      <div className="page-heading"><div><p className="eyebrow mb-2">PEOPLE DIRECTORY</p><h1 className="h2 fw-semibold mb-1">Employees</h1><p className="text-secondary mb-0">Manage employee profiles and account access.</p></div><button aria-expanded={formOpen} className="btn btn-success" onClick={() => setFormOpen((open) => !open)} type="button">{formOpen ? 'Cancel' : '＋ Add employee'}</button></div>
      {formOpen && <div className="mb-4">
        <form className="form-panel row g-3" onSubmit={addEmployee}>
          <div className="col-12"><h2 className="h5 mb-0">New employee</h2></div>
          {[['first_name', 'First name', 'text'], ['last_name', 'Last name', 'text'], ['email', 'Work email', 'email'], ['password', 'Initial password', 'password'], ['phone', 'Phone', 'tel'], ['department', 'Department', 'text'], ['designation', 'Designation', 'text'], ['date_of_joining', 'Date of joining', 'date']].map(([name, label, type]) => (
            <div className="col-12 col-sm-6 col-lg-3" key={name}><label className="form-label" htmlFor={`employee-${name}`}>{label}</label><input className="form-control" id={`employee-${name}`} name={name} onChange={updateForm} required value={form[name]} type={type} /></div>
          ))}
          <div className="col-12"><button className="btn btn-success" disabled={saving} type="submit">{saving ? 'Saving…' : 'Create employee'}</button></div>
        </form>
      </div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      <div className="table-panel">
        <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>DESIGNATION</th><th>JOINED</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
          <tbody>{loading ? <tr><td className="py-4 text-center text-secondary" colSpan="5">Loading employees…</td></tr> : employees.length === 0 ? <tr><td className="py-4 text-center text-secondary" colSpan="5">No employees found.</td></tr> : employees.map((employee) => (
            <tr key={employee.id}><td><div className="fw-semibold">{employee.first_name} {employee.last_name}</div><div className="small text-secondary">{employee.email}</div></td><td>{employee.department}</td><td>{employee.designation}</td><td>{employee.date_of_joining}</td><td className="text-end"><button aria-label={`Delete ${employee.first_name} ${employee.last_name}`} className="btn btn-sm btn-outline-danger" onClick={() => deleteEmployee(employee)} type="button">Delete</button></td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </section>
  )
}

export default EmployeeList
