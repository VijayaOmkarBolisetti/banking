import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Logo } from '../../components/brand/Logo'
import { ROUTES } from '../../navigation/routes'
import { ADMIN_CREDENTIALS, logOperation, useAdminStore } from '../../store/useAdminStore'

export function AdminLoginScreen() {
  const navigate = useNavigate()
  const login = useAdminStore((state) => state.login)
  const isAdminAuthenticated = useAdminStore((state) => state.isAdminAuthenticated)
  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  if (isAdminAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_HOME} replace />
  }

  function submit() {
    setLoading(true)
    const result = login(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.message)
      return
    }
    logOperation('admin', 'admin', 'Admin signed in', ADMIN_CREDENTIALS.email)
    navigate(ROUTES.ADMIN_HOME)
  }

  return (
    <div className="admin-stage items-center justify-center overflow-y-auto bg-slate-100 px-4 py-6 sm:px-6">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgb(15_23_42_/_0.08)] sm:p-8">
        <Logo size={48} />
        <h1 className="mt-5 text-2xl font-extrabold text-ink">CreditFlow Admin</h1>
        <p className="mt-1 text-sm text-muted">Control EMI range, limits and live operations.</p>
        <div className="mt-6 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Password"
            type="password"
            value={password}
            error={error}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />
        </div>
        <div className="mt-6">
          <Button onClick={submit} loading={loading}>
            Sign in
          </Button>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-ink">Admin credentials</p>
          <p className="mt-2 text-muted">Email: {ADMIN_CREDENTIALS.email}</p>
          <p className="text-muted">Password: {ADMIN_CREDENTIALS.password}</p>
        </div>
      </div>
    </div>
  )
}