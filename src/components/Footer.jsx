import { Link } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { Icon } from './ui';

export default function Footer() {
  const { openReview, openFellowship } = useUI();

  const columns = [
    {
      heading: 'Platform',
      links: [
        { label: 'Explore Courses', to: '/courses' },
        { label: 'My Learning', to: '/my-learning' },
        { label: 'Instructor Studio', to: '/studio' },
        { label: 'Fellowship Program', action: openFellowship },
      ],
    },
    {
      heading: 'Academics',
      links: [
        { label: 'Research Lectures', to: '/courses' },
        { label: 'Verified Credentials', to: '/my-learning' },
        { label: 'Office Hours', action: () => {} },
        { label: 'Syllabi & Labs', to: '/courses' },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'Contact', to: '/contact' },
        { label: 'Help Centre', to: '/contact' },
        { label: 'Leave a Review', action: () => openReview({}) },
        { label: 'Report an Issue', to: '/contact' },
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-line bg-surface-low pb-12 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <Icon name="school" fill />
              </div>
              <span className="font-display text-xl font-extrabold text-primary-accent">Sankalp</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-on-surface-variant">
              Collegiate-grade video instruction, academic research lectures and validated credentials
              for ambitious students.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
              <Icon name="verified" className="text-base" /> Accredited Digital Education
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-on-surface">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="text-sm text-on-surface-variant transition hover:text-primary-accent">
                        {l.label}
                      </Link>
                    ) : (
                      <button
                        onClick={l.action}
                        className="text-sm text-on-surface-variant transition hover:text-primary-accent"
                      >
                        {l.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-6 sm:flex-row">
          <p className="text-xs text-on-surface-variant">
            © {new Date().getFullYear()} Sankalp Institute of Technology. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Icon name="shield_lock" className="text-base text-secondary" /> Secure Razorpay checkout
          </p>
        </div>
      </div>
    </footer>
  );
}
