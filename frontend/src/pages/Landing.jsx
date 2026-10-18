import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ResumePreview from '../templates/ResumePreview.jsx';
import { SAMPLE_RESUME } from '../templates/resumeModel.js';

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-text">
          <h1>Dakikalar içinde profesyonel bir CV oluşturun</h1>
          <p className="lead">
            Bilgilerinizi girin, şablonunuzu ve renginizi seçin, canlı önizlemeyi izleyin ve CV'nizi tek tıkla PDF olarak
            indirin.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Hemen başla</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Giriş yap</Link>
          </div>
          <ul className="feature-list">
            <li>3 farklı şablon ve özel renk seçimi</li>
            <li>Değişiklikler otomatik kaydedilir</li>
            <li>Yazdır / PDF olarak indir</li>
          </ul>
        </div>
        <div className="hero-preview" aria-hidden="true">
          <div className="thumb-frame thumb-lg">
            <ResumePreview resume={SAMPLE_RESUME} scale={0.5} />
          </div>
        </div>
      </section>
    </main>
  );
}
