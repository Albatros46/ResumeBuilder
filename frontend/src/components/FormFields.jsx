import { useState } from 'react';
import { emptyItem, SECTION_FIELDS } from '../templates/resumeModel.js';

export function Field({ field, value, onChange }) {
  const { name, label, type = 'text', full } = field;
  const common = { value: value ?? '', onChange: (e) => onChange(name, e.target.value) };

  return (
    <label className={`field ${full || type === 'textarea' ? 'field-full' : ''}`}>
      <span>
        {label}
        {type === 'range' && <em className="hint"> · %{value ?? 0}</em>}
      </span>
      {type === 'textarea' ? (
        <textarea rows={4} {...common} />
      ) : type === 'range' ? (
        <input type="range" min={0} max={100} step={5} value={value ?? 0} onChange={(e) => onChange(name, Number(e.target.value))} />
      ) : (
        <input type={type} {...common} />
      )}
    </label>
  );
}

// Nesne alanlari icin form (profil, iletisim)
export function ObjectEditor({ fields, value, onChange }) {
  return (
    <div className="form-grid">
      {fields.map((f) => (
        <Field key={f.name} field={f} value={value[f.name]} onChange={(name, v) => onChange({ ...value, [name]: v })} />
      ))}
    </div>
  );
}

// Tekrarlanan kayitlar icin form (deneyim, egitim, yetenek ...)
export function ListEditor({ section, items, onChange, itemLabel }) {
  const fields = SECTION_FIELDS[section];

  const update = (index, name, v) => onChange(items.map((item, i) => (i === index ? { ...item, [name]: v } : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));
  const move = (index, dir) => {
    const next = [...items];
    const target = index + dir;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="list-editor">
      {items.length === 0 && <p className="muted">Henüz kayıt yok.</p>}
      {items.map((item, index) => (
        <div key={index} className="list-item">
          <div className="list-item-head">
            <strong>
              {itemLabel} #{index + 1}
            </strong>
            <div className="list-item-actions">
              <button type="button" className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} title="Yukarı taşı">
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                title="Aşağı taşı"
              >
                ↓
              </button>
              <button type="button" className="icon-btn danger" onClick={() => remove(index)} title="Sil">
                ✕
              </button>
            </div>
          </div>
          <div className="form-grid">
            {fields.map((f) => (
              <Field key={f.name} field={f} value={item[f.name]} onChange={(name, v) => update(index, name, v)} />
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={() => onChange([...items, emptyItem(section)])}>
        + {itemLabel} ekle
      </button>
    </div>
  );
}

export function TagEditor({ items, onChange, placeholder }) {
  const [text, setText] = useState('');

  const add = () => {
    const v = text.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setText('');
  };

  return (
    <div>
      <div className="tag-input">
        <input
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-outline" onClick={add}>
          Ekle
        </button>
      </div>
      <div className="tags">
        {items.map((t) => (
          <span key={t} className="tag">
            {t}
            <button type="button" onClick={() => onChange(items.filter((x) => x !== t))} aria-label={`${t} kaldır`}>
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
