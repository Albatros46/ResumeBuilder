import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi, getErrorMessage } from '../api/client.js';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'Doğrulama bağlantısı geçersiz.');
  const requested = useRef(false);

  useEffect(() => {
    // StrictMode'da effect iki kez calisir; token tek kullanimlik oldugu icin istek bir kez atilir.
    if (!token || requested.current) return;
    requested.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(getErrorMessage(err, 'E-posta doğrulanamadı.'));
      });
  }, [token]);

  return (
    <main className="auth-page">
      <div className="card auth-card center">
        {status === 'loading' && <p className="muted">E-posta adresiniz doğrulanıyor…</p>}
        {status === 'success' && (
          <>
            <div className="big-icon">✅</div>
            <h2>E-posta doğrulandı</h2>
            <p className="muted">Hesabınız etkinleştirildi. Artık giriş yapabilirsiniz.</p>
            <Link to="/login" className="btn btn-primary btn-block">Giriş yap</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="big-icon">⚠️</div>
            <h2>Doğrulama başarısız</h2>
            <p className="muted">{message}</p>
            <Link to="/login" className="btn btn-outline btn-block">Giriş sayfasına dön</Link>
          </>
        )}
      </div>
    </main>
  );
}
