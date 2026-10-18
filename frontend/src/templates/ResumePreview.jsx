import { useEffect, useRef, useState } from 'react';
import { filled, formatRange } from './resumeModel.js';
import './templates.css';

export const PAGE_WIDTH = 794; // A4 genisligi (96 dpi)
export const PAGE_HEIGHT = 1123;

/**
 * CV'yi A4 olcusunde cizer.
 * scale verilirse sabit olcekte, verilmezse kapsayicinin genisligine sigacak sekilde kucultulur.
 */
export default function ResumePreview({ resume, scale }) {
  const wrapRef = useRef(null);
  const [autoScale, setAutoScale] = useState(1);

  useEffect(() => {
    if (scale || !wrapRef.current) return;
    const el = wrapRef.current.parentElement;
    const observer = new ResizeObserver(([entry]) => {
      setAutoScale(Math.min(1, entry.contentRect.width / PAGE_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [scale]);

  const s = scale || autoScale;
  const Template = TEMPLATE_COMPONENTS[resume.template?.theme] || Classic;

  return (
    <div ref={wrapRef} className="resume-scale-wrap" style={{ width: PAGE_WIDTH * s, height: PAGE_HEIGHT * s }}>
      <div
        className="resume-page"
        style={{ transform: `scale(${s})`, '--accent': resume.template?.colorPalette || '#2563eb' }}
      >
        <Template r={resume} />
      </div>
    </div>
  );
}

/* ---------- ortak parcalar ---------- */

function Section({ title, children, className = '' }) {
  return (
    <section className={`rs-section ${className}`}>
      <h3 className="rs-heading">{title}</h3>
      {children}
    </section>
  );
}

function Bar({ value }) {
  return (
    <div className="rs-bar">
      <div className="rs-bar-fill" style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }} />
    </div>
  );
}

function ContactList({ c, inline }) {
  const items = [
    ['✉', c.email],
    ['☎', c.phone],
    ['⌂', c.location],
    ['in', c.linkedIn],
    ['gh', c.github],
    ['🌐', c.website],
  ].filter(([, v]) => v);
  if (!items.length) return null;
  return (
    <ul className={inline ? 'rs-contact-inline' : 'rs-contact'}>
      {items.map(([icon, v]) => (
        <li key={icon}>
          <span className="rs-contact-icon">{icon}</span>
          {v}
        </li>
      ))}
    </ul>
  );
}

function Photo({ url, size = 110 }) {
  if (!url) return null;
  return <img className="rs-photo" src={url} alt="" style={{ width: size, height: size }} />;
}

function Experience({ items }) {
  const list = filled(items);
  if (!list.length) return null;
  return (
    <Section title="İş Deneyimi">
      {list.map((w, i) => (
        <div key={i} className="rs-item">
          <div className="rs-item-head">
            <strong>{w.role}</strong>
            <span className="rs-date">{formatRange(w.startDate, w.endDate)}</span>
          </div>
          {w.company && <div className="rs-sub">{w.company}</div>}
          {w.description && <p className="rs-text">{w.description}</p>}
        </div>
      ))}
    </Section>
  );
}

function Education({ items }) {
  const list = filled(items);
  if (!list.length) return null;
  return (
    <Section title="Eğitim">
      {list.map((e, i) => (
        <div key={i} className="rs-item">
          <div className="rs-item-head">
            <strong>{e.degree}</strong>
            <span className="rs-date">{formatRange(e.startDate, e.endDate)}</span>
          </div>
          {e.institution && <div className="rs-sub">{e.institution}</div>}
        </div>
      ))}
    </Section>
  );
}

function Projects({ items }) {
  const list = filled(items);
  if (!list.length) return null;
  return (
    <Section title="Projeler">
      {list.map((p, i) => (
        <div key={i} className="rs-item">
          <strong>{p.title}</strong>
          {p.description && <p className="rs-text">{p.description}</p>}
          {(p.github || p.liveDemo) && (
            <div className="rs-links">
              {p.github && <span>GitHub: {p.github}</span>}
              {p.liveDemo && <span>Demo: {p.liveDemo}</span>}
            </div>
          )}
        </div>
      ))}
    </Section>
  );
}

function Certifications({ items }) {
  const list = filled(items);
  if (!list.length) return null;
  return (
    <Section title="Sertifikalar">
      {list.map((c, i) => (
        <div key={i} className="rs-item rs-item-compact">
          <div className="rs-item-head">
            <strong>{c.title}</strong>
            <span className="rs-date">{c.year}</span>
          </div>
          {c.issuer && <div className="rs-sub">{c.issuer}</div>}
        </div>
      ))}
    </Section>
  );
}

function Levels({ title, items }) {
  const list = filled(items);
  if (!list.length) return null;
  return (
    <Section title={title}>
      {list.map((s, i) => (
        <div key={i} className="rs-level">
          <span>{s.name}</span>
          <Bar value={s.progress} />
        </div>
      ))}
    </Section>
  );
}

function Tags({ title, items }) {
  const list = filled(items);
  if (!list.length) return null;
  return (
    <Section title={title}>
      <div className="rs-tags">
        {list.map((t, i) => (
          <span key={i} className="rs-tag">{t}</span>
        ))}
      </div>
    </Section>
  );
}

function Summary({ text, title = 'Hakkımda' }) {
  if (!text?.trim()) return null;
  return (
    <Section title={title}>
      <p className="rs-text">{text}</p>
    </Section>
  );
}

/* ---------- sablonlar ---------- */

function Classic({ r }) {
  const p = r.profileInfo;
  return (
    <div className="tpl tpl-classic">
      <header className="rs-header">
        <Photo url={p.profilePreviewUrl} size={96} />
        <h1 className="rs-name">{p.fullName || 'Adınız Soyadınız'}</h1>
        {p.designation && <div className="rs-title">{p.designation}</div>}
        <ContactList c={r.contactInfo} inline />
      </header>
      <Summary text={p.summary} />
      <Experience items={r.workExperience} />
      <Projects items={r.projects} />
      <Education items={r.education} />
      <div className="rs-two-col">
        <Levels title="Yetenekler" items={r.skills} />
        <Levels title="Diller" items={r.languages} />
      </div>
      <Certifications items={r.certifications} />
      <Tags title="İlgi Alanları" items={r.interests} />
    </div>
  );
}

function Modern({ r }) {
  const p = r.profileInfo;
  return (
    <div className="tpl tpl-modern">
      <aside className="rs-sidebar">
        <Photo url={p.profilePreviewUrl} size={130} />
        <h1 className="rs-name">{p.fullName || 'Adınız Soyadınız'}</h1>
        {p.designation && <div className="rs-title">{p.designation}</div>}
        {Object.values(r.contactInfo).some((v) => typeof v === 'string' && v.trim()) && (
          <Section title="İletişim">
            <ContactList c={r.contactInfo} />
          </Section>
        )}
        <Levels title="Yetenekler" items={r.skills} />
        <Levels title="Diller" items={r.languages} />
        <Tags title="İlgi Alanları" items={r.interests} />
      </aside>
      <div className="rs-main">
        <Summary text={p.summary} title="Profil" />
        <Experience items={r.workExperience} />
        <Projects items={r.projects} />
        <Education items={r.education} />
        <Certifications items={r.certifications} />
      </div>
    </div>
  );
}

function Minimal({ r }) {
  const p = r.profileInfo;
  return (
    <div className="tpl tpl-minimal">
      <header className="rs-header">
        <div>
          <h1 className="rs-name">{p.fullName || 'Adınız Soyadınız'}</h1>
          {p.designation && <div className="rs-title">{p.designation}</div>}
          <ContactList c={r.contactInfo} inline />
        </div>
        <Photo url={p.profilePreviewUrl} size={100} />
      </header>
      <div className="rs-body">
        <div className="rs-main">
          <Summary text={p.summary} />
          <Experience items={r.workExperience} />
          <Projects items={r.projects} />
        </div>
        <div className="rs-side">
          <Education items={r.education} />
          <Levels title="Yetenekler" items={r.skills} />
          <Levels title="Diller" items={r.languages} />
          <Certifications items={r.certifications} />
          <Tags title="İlgi Alanları" items={r.interests} />
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_COMPONENTS = { classic: Classic, modern: Modern, minimal: Minimal };
