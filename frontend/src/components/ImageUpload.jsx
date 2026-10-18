import { useRef, useState } from 'react';
import { authApi, getErrorMessage } from '../api/client.js';
import Avatar from './Avatar.jsx';

// Resmi hemen sunucuya yukler ve donen URL'i onChange ile bildirir.
export default function ImageUpload({ value, onChange, name, label = 'Fotoğraf' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      onChange(await authApi.uploadImage(file));
    } catch (err) {
      setError(getErrorMessage(err, 'Resim yüklenemedi.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <Avatar src={value} name={name} size={64} />
      <div>
        <div className="image-upload-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Yükleniyor…' : value ? 'Değiştir' : `${label} yükle`}
          </button>
          {value && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
              Kaldır
            </button>
          )}
        </div>
        <p className="hint">JPG, PNG veya WEBP · en fazla 5MB</p>
        {error && <p className="field-error">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={handleFile} />
    </div>
  );
}
