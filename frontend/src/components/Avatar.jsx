export default function Avatar({ src, name, size = 40 }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return src ? (
    <img className="avatar" src={src} alt={name} style={{ width: size, height: size }} />
  ) : (
    <span className="avatar avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </span>
  );
}
