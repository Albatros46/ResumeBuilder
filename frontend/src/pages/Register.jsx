import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', profileImageUrl: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const data = await register(form);
      // E-posta dogrulamasi kapaliysa backend token dondurur ve dogrudan panele gecilir.
      if (data.token) navigate('/dashboard', { replace: true });
      else setRegisteredEmail(data.email);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && typeof errors === 'object') setFieldErrors(errors);
      else setError(getErrorMessage(err, 'Kayıt başarısız.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredEmail) {
    return (
      <main className="auth-page">
        <div className="card auth-card center">
          <div className="big-icon">✉️</div>
          <h2>E-postanızı kontrol edin</h2>
          <p className="muted">
            <strong>{registeredEmail}</strong> adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra
            giriş yapabilirsiniz.
          </p>
          <Link to="/login" className="btn btn-primary btn-block">Giriş sayfasına git</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h2>Hesap oluşturun</h2>
        <p className="muted">Ücretsiz kaydolun ve ilk CV'nizi oluşturun.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <ImageUpload
          value={form.profileImageUrl}
          name={form.name}
          label="Profil fotoğrafı"
          onChange={(url) => setForm((f) => ({ ...f, profileImageUrl: url }))}
        />

        <label className="field">
          <span>Ad Soyad</span>
          <input name="name" value={form.name} onChange={handleChange} required minLength={3} maxLength={20} />
          {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
        </label>
        <label className="field">
          <span>E-posta</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
          {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
        </label>
        <label className="field">
          <span>Şifre</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={15}
            autoComplete="new-password"
          />
          <small className="hint">5–15 karakter</small>
          {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
        </label>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Kaydediliyor…' : 'Kayıt ol'}
        </button>
        <p className="muted center">
          Zaten hesabınız var mı? <Link to="/login">Giriş yapın</Link>
        </p>
      </form>
    </main>
  );
}
