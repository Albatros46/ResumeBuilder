import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage, resumeApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ResumePreview from '../templates/ResumePreview.jsx';
import { normalizeResume } from '../templates/resumeModel.js';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    resumeApi
      .list()
      .then(setResumes)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const created = await resumeApi.create(title.trim());
      navigate(`/resume/${created.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setCreating(false);
    }
  };

  const handleDelete = async (resume) => {
    if (!window.confirm(`"${resume.title}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    try {
      await resumeApi.remove(resume.id);
      setResumes((list) => list.filter((r) => r.id !== resume.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <main className="container">
      <div className="page-header">
        <div>
          <h1>Merhaba, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="muted">CV'lerinizi buradan yönetin.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Yeni CV</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Yükleniyor…</p>
      ) : resumes.length === 0 ? (
        <div className="empty card">
          <div className="big-icon">📄</div>
          <h3>Henüz CV'niz yok</h3>
          <p className="muted">İlk CV'nizi oluşturarak başlayın.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>CV oluştur</button>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map((r) => (
            <div key={r.id} className="resume-card card">
              <Link to={`/resume/${r.id}`} className="thumb-frame">
                <ResumePreview resume={normalizeResume(r)} scale={0.3} />
              </Link>
              <div className="resume-card-body">
                <div>
                  <Link to={`/resume/${r.id}`} className="resume-card-title">{r.title}</Link>
                  <p className="hint">Son güncelleme: {formatDate(r.updatedAt)}</p>
                </div>
                <button className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(r)} title="Sil">
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h3>Yeni CV oluştur</h3>
            <p className="muted">CV'nize bir başlık verin. Daha sonra değiştirebilirsiniz.</p>
            <label className="field">
              <span>Başlık</span>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ör. Frontend Developer CV"
                maxLength={100}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Vazgeç</button>
              <button className="btn btn-primary" disabled={creating || !title.trim()}>
                {creating ? 'Oluşturuluyor…' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
