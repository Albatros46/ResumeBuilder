import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar no-print">
      <Link to={user ? '/dashboard' : '/'} className="brand">
        <span className="brand-mark">R</span> ResumeBuilder
      </Link>
      <nav className="nav-actions">
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost">CV'lerim</Link>
            <div className="nav-user">
              <Avatar src={user.profileImageUrl} name={user.name} size={32} />
              <span className="nav-user-name">{user.name}</span>
            </div>
            <button className="btn btn-outline" onClick={handleLogout}>Çıkış</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Giriş yap</Link>
            <Link to="/register" className="btn btn-primary">Ücretsiz başla</Link>
          </>
        )}
      </nav>
    </header>
  );
}
