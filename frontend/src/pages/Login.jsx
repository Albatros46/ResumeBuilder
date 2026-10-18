import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi, getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.message || '');
  const [notVerified, setNotVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setNotVerified(false);
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Giriş başarısız.'));
      setNotVerified(err.response?.status === 403);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await authApi.resendVerification(form.email);
      setNotVerified(false);
      setInfo('Doğrulama e-postası tekrar gönderildi. Gelen kutunuzu kontrol edin.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Tekrar hoş geldiniz</h2>
        <p className="muted">CV'lerinize erişmek için giriş yapın.</p>

        {info && <div className="alert alert-success">{info}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {notVerified && (
          <button type="button" className="btn btn-outline btn-block" onClick={handleResend}>
            Doğrulama e-postasını tekrar gönder
          </button>
        )}

        <label className="field">
          <span>E-posta</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Şifre</span>
          <input name="password" type="password" value={form.password} onChange={handleChange} required autoComplete="current-password" />
        </label>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
        <p className="muted center">
          Hesabınız yok mu? <Link to="/register">Kayıt olun</Link>
        </p>
      </form>
    </main>
  );
}
