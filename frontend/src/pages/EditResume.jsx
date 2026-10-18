import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage, resumeApi } from '../api/client.js';
import ImageUpload from '../components/ImageUpload.jsx';
import { ListEditor, ObjectEditor, TagEditor } from '../components/FormFields.jsx';
import ResumePreview from '../templates/ResumePreview.jsx';
import { COLORS, normalizeResume, TEMPLATES } from '../templates/resumeModel.js';

const STEPS = [
  { id: 'profile', label: 'Profil' },
  { id: 'contact', label: 'İletişim' },
  { id: 'workExperience', label: 'Deneyim' },
  { id: 'education', label: 'Eğitim' },
  { id: 'skills', label: 'Yetenekler' },
  { id: 'projects', label: 'Projeler' },
  { id: 'certifications', label: 'Sertifikalar' },
  { id: 'extra', label: 'Diller & İlgi' },
];

const PROFILE_FIELDS = [
  { name: 'fullName', label: 'Ad Soyad' },
  { name: 'designation', label: 'Unvan' },
  { name: 'summary', label: 'Özet / Hakkımda', type: 'textarea' },
];

const CONTACT_FIELDS = [
  { name: 'email', label: 'E-posta', type: 'email' },
  { name: 'phone', label: 'Telefon', type: 'tel' },
  { name: 'location', label: 'Konum' },
  { name: 'linkedIn', label: 'LinkedIn' },
  { name: 'github', label: 'GitHub' },
  { name: 'website', label: 'Web sitesi' },
];

const SAVE_DELAY_MS = 1200;

const STATUS_TEXT = {
  saved: 'Tüm değişiklikler kaydedildi',
  unsaved: 'Kaydedilmemiş değişiklikler',
  saving: 'Kaydediliyor…',
  error: 'Kaydedilemedi',
};

export default function EditResume() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('saved');
  const [saveError, setSaveError] = useState('');
  const latest = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    resumeApi
      .get(id)
      .then((r) => setResume(normalizeResume(r)))
      .catch((err) => setLoadError(getErrorMessage(err, 'CV yüklenemedi.')));
  }, [id]);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    const data = latest.current;
    if (!data) return;
    if (!data.title.trim()) {
      setStatus('error');
      setSaveError('Başlık boş olamaz.');
      return;
    }
    setStatus('saving');
    try {
      await resumeApi.update(id, data);
      // Kayit surerken yeni degisiklik yapildiysa durum "kaydedilmedi" olarak kalir
      setStatus(latest.current === data ? 'saved' : 'unsaved');
      setSaveError('');
    } catch (err) {
      setStatus('error');
      setSaveError(getErrorMessage(err));
    }
  }, [id]);

  // Her degisiklikten kisa bir sure sonra otomatik kaydet
  const change = (updater) => {
    setResume((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      latest.current = next;
      return next;
    });
    setStatus('unsaved');
    clearTimeout(timer.current);
    timer.current = setTimeout(save, SAVE_DELAY_MS);
  };

  // Kaydedilmemis degisiklik varken sayfadan cikmadan once uyar
  useEffect(() => {
    const handler = (e) => {
      if (status === 'unsaved' || status === 'saving') e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [status]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (loadError) {
    return (
      <main className="container">
        <div className="alert alert-error">{loadError}</div>
        <Link to="/dashboard" className="btn btn-outline">Panele dön</Link>
      </main>
    );
  }
  if (!resume) return <div className="page-center muted">Yükleniyor…</div>;

  const setField = (key) => (value) => change((r) => ({ ...r, [key]: value }));
  const current = STEPS[step].id;

  const handlePrint = async () => {
    if (status === 'unsaved') await save();
    const previousTitle = document.title;
    document.title = resume.title || 'CV'; // PDF dosya adi olarak kullanilir
    window.print();
    document.title = previousTitle;
  };

  return (
    <main className="editor">
      <div className="editor-toolbar no-print">
        <Link to="/dashboard" className="btn btn-ghost btn-sm">← Geri</Link>
        <input
          className="title-input"
          value={resume.title}
          onChange={(e) => change((r) => ({ ...r, title: e.target.value }))}
          aria-label="CV başlığı"
          maxLength={100}
        />
        <span className={`save-status status-${status}`} title={saveError}>
          {STATUS_TEXT[status]}
          {status === 'error' && saveError ? `: ${saveError}` : ''}
        </span>
        <div className="toolbar-spacer" />
        <button className="btn btn-outline btn-sm" onClick={save} disabled={status === 'saving'}>Kaydet</button>
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>PDF indir</button>
      </div>

      <div className="editor-body">
        <section className="editor-form no-print">
          <div className="card">
            <div className="design-row">
              <div>
                <span className="label">Şablon</span>
                <div className="segmented">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      className={resume.template.theme === t.id ? 'active' : ''}
                      onClick={() => setField('template')({ ...resume.template, theme: t.id })}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="label">Renk</span>
                <div className="swatches">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className={`swatch ${resume.template.colorPalette === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setField('template')({ ...resume.template, colorPalette: c })}
                      aria-label={`Renk ${c}`}
                    />
                  ))}
                  <input
                    type="color"
                    className="swatch-custom"
                    value={resume.template.colorPalette}
                    onChange={(e) => setField('template')({ ...resume.template, colorPalette: e.target.value })}
                    title="Özel renk"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="steps">
              {STEPS.map((s, i) => (
                <button key={s.id} className={i === step ? 'active' : ''} onClick={() => setStep(i)}>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="step-content">
              {current === 'profile' && (
                <>
                  <ImageUpload
                    value={resume.profileInfo.profilePreviewUrl}
                    name={resume.profileInfo.fullName}
                    onChange={(url) => setField('profileInfo')({ ...resume.profileInfo, profilePreviewUrl: url })}
                  />
                  <ObjectEditor fields={PROFILE_FIELDS} value={resume.profileInfo} onChange={setField('profileInfo')} />
                </>
              )}
              {current === 'contact' && (
                <ObjectEditor fields={CONTACT_FIELDS} value={resume.contactInfo} onChange={setField('contactInfo')} />
              )}
              {current === 'workExperience' && (
                <ListEditor section="workExperience" itemLabel="Deneyim" items={resume.workExperience} onChange={setField('workExperience')} />
              )}
              {current === 'education' && (
                <ListEditor section="education" itemLabel="Eğitim" items={resume.education} onChange={setField('education')} />
              )}
              {current === 'skills' && (
                <ListEditor section="skills" itemLabel="Yetenek" items={resume.skills} onChange={setField('skills')} />
              )}
              {current === 'projects' && (
                <ListEditor section="projects" itemLabel="Proje" items={resume.projects} onChange={setField('projects')} />
              )}
              {current === 'certifications' && (
                <ListEditor section="certifications" itemLabel="Sertifika" items={resume.certifications} onChange={setField('certifications')} />
              )}
              {current === 'extra' && (
                <>
                  <h4>Diller</h4>
                  <ListEditor section="languages" itemLabel="Dil" items={resume.languages} onChange={setField('languages')} />
                  <h4>İlgi alanları</h4>
                  <TagEditor items={resume.interests} onChange={setField('interests')} placeholder="ör. Satranç (Enter ile ekle)" />
                </>
              )}
            </div>

            <div className="step-nav">
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
                ← Önceki
              </button>
              <span className="hint">
                {step + 1} / {STEPS.length}
              </span>
              <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={step === STEPS.length - 1}>
                Sonraki →
              </button>
            </div>
          </div>
        </section>

        <section className="editor-preview">
          <div className="preview-sticky print-area">
            <ResumePreview resume={resume} />
          </div>
        </section>
      </div>
    </main>
  );
}
