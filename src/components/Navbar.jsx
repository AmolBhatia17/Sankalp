import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useBookmarks, useNotifications } from '../hooks/useData';
import { markNotificationRead } from '../lib/userContent';
import { Icon, Badge } from './ui';
import { initialsOf } from '../lib/format';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, displayName, photoURL, role, toggleRole, logout } = useAuth();
  const { openAuth } = useUI();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState(''); // 'bookmarks' | 'notifications' | 'user' | 'mobile' | ''
  const wrapperRef = useRef(null);

  const bookmarks = useBookmarks(user?.uid) || [];
  const notifications = useNotifications(user?.uid) || [];
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setMenu('');
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Catalog', path: '/courses' },
    ...(user ? [{ name: 'My Learning', path: '/my-learning' }] : []),
    ...(role === 'instructor' ? [{ name: 'Studio', path: '/studio' }] : []),
  ];

  const isActive = (p) => (p === '/' ? location.pathname === '/' : location.pathname.startsWith(p));

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/courses?q=${encodeURIComponent(search.trim())}`);
    setMenu('');
  };

  const handleRoleToggle = async () => {
    await toggleRole();
    setMenu('');
    navigate(role === 'instructor' ? '/my-learning' : '/studio');
  };

  const handleLogout = async () => {
    setMenu('');
    await logout();
    navigate('/');
  };

  const openBookmark = (bm) => {
    setMenu('');
    if (bm.courseId) navigate(`/learn/${bm.courseId}/${bm.lectureId || ''}`);
  };

  const popover =
    'absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-line bg-card p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150';

  return (
    <nav className="fixed left-0 top-0 z-50 h-20 w-full border-b border-line-strong/30 bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Icon name="school" fill />
          </div>
          <span className="font-display text-xl font-extrabold text-primary-accent">Sankalp</span>
          <span className="ml-1 hidden rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase text-secondary sm:inline">
            {user ? 'Learner' : 'Guest'}
          </span>
        </Link>

        <div className="hidden xl:flex xl:items-center xl:gap-1">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive(l.path)
                  ? 'border-b-2 border-primary text-primary-accent'
                  : 'text-on-surface-variant hover:text-primary-accent'
              }`}
            >
              {l.name}
            </Link>
          ))}
        </div>

        <form onSubmit={onSearch} className="relative ml-auto hidden lg:block">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-56 rounded-xl bg-surface-low py-2.5 pl-10 pr-3 text-sm outline-none transition focus:w-72 focus:ring-2 focus:ring-primary-hover/40"
          />
        </form>

        <div ref={wrapperRef} className="relative ml-auto flex items-center gap-2 lg:ml-0">
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-low"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={isDark ? 'light_mode' : 'dark_mode'} />
          </button>

          {user && (
            <>
              <button
                onClick={() => setMenu(menu === 'bookmarks' ? '' : 'bookmarks')}
                className="relative rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-low"
                aria-label="Bookmarks"
              >
                <Icon name="bookmark" />
                {bookmarks.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-hover text-[10px] font-bold text-white">
                    {bookmarks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMenu(menu === 'notifications' ? '' : 'notifications')}
                className="relative rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-low"
                aria-label="Notifications"
              >
                <Icon name="notifications" />
                {unread > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
                )}
              </button>
            </>
          )}

          {user ? (
            <button
              onClick={() => setMenu(menu === 'user' ? '' : 'user')}
              className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-surface-low"
            >
              {photoURL ? (
                <img src={photoURL} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-xs font-bold text-primary-accent">
                  {initialsOf(displayName || user.email)}
                </span>
              )}
              <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:block">
                {displayName || user.email}
              </span>
              <Icon name="expand_more" className="text-muted" />
            </button>
          ) : (
            <button
              onClick={() => openAuth()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <Icon name="login" className="text-base" />
              Sign In
            </button>
          )}

          {menu === 'bookmarks' && (
            <div className={popover}>
              <p className="mb-2 font-display text-sm font-bold">Saved bookmarks</p>
              {bookmarks.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted">No bookmarks yet.</p>
              ) : (
                <div className="custom-scrollbar max-h-72 space-y-1 overflow-y-auto">
                  {bookmarks.map((bm) => (
                    <button
                      key={bm.id}
                      onClick={() => openBookmark(bm)}
                      className="flex w-full items-start gap-2 rounded-xl p-2 text-left transition hover:bg-surface-low"
                    >
                      <Icon name="bookmark" fill className="text-primary-hover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{bm.title}</span>
                        <span className="text-xs text-muted">
                          {bm.timestamp}
                          {bm.courseTitle ? ` · ${bm.courseTitle}` : ''}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {menu === 'notifications' && (
            <div className={popover}>
              <p className="mb-2 font-display text-sm font-bold">Notifications</p>
              {notifications.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted">You're all caught up.</p>
              ) : (
                <div className="custom-scrollbar max-h-72 space-y-1 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(user.uid, n.id)}
                      className="flex w-full items-start gap-2 rounded-xl p-2 text-left transition hover:bg-surface-low"
                    >
                      <Icon
                        name={n.type === 'grade' ? 'grade' : n.type === 'live' ? 'podcasts' : 'update'}
                        className="text-primary-accent"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{n.title}</span>
                        <span className="block text-xs text-on-surface-variant">{n.description}</span>
                      </span>
                      {!n.isRead && <span className="ml-auto mt-1 h-2 w-2 rounded-full bg-error" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {menu === 'user' && user && (
            <div className={popover}>
              <div className="flex items-center gap-3">
                {photoURL ? (
                  <img src={photoURL} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary-accent">
                    {initialsOf(displayName || user.email)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{displayName || 'Learner'}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>

              <div className="my-3 flex items-center justify-between">
                <Badge tone={role === 'instructor' ? 'success' : 'primary'}>
                  <Icon name={role === 'instructor' ? 'school' : 'person'} className="text-sm" />
                  {role === 'instructor' ? 'Instructor' : 'Student'}
                </Badge>
                <button
                  onClick={handleRoleToggle}
                  className="text-xs font-semibold text-primary-accent hover:underline"
                >
                  Switch to {role === 'instructor' ? 'Student' : 'Instructor'} →
                </button>
              </div>

              <div className="h-px bg-surface-highest" />

              <Link
                to="/my-learning"
                onClick={() => setMenu('')}
                className="mt-2 flex items-center gap-2 rounded-xl p-2 text-sm font-semibold transition hover:bg-surface-low"
              >
                <Icon name="play_circle" className="text-on-surface-variant" /> My Learning
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl p-2 text-sm font-semibold text-error transition hover:bg-error-container/50"
              >
                <Icon name="logout" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
