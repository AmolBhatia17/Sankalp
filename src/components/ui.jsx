export function Icon({ name, className = '', fill = false }) {
  return (
    <span
      className={`material-symbols-outlined ${fill ? 'material-symbols-fill' : ''} ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function RatingStars({ rating = 0, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          fill={i <= Math.round(rating)}
          className={`text-base ${i <= Math.round(rating) ? 'text-gold' : 'text-faint'}`}
        />
      ))}
    </span>
  );
}

export function ProgressBar({ value = 0, className = '', barClassName = 'bg-primary' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-container ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Badge({ children, tone = 'primary', className = '' }) {
  const tones = {
    primary: 'bg-surface-container text-primary-accent',
    success: 'bg-secondary-container/40 text-secondary',
    warn: 'bg-warn-container text-warn',
    error: 'bg-error-container text-error',
    neutral: 'bg-surface-low text-on-surface-variant',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-card px-6 py-16 text-center">
      <Icon name={icon} className="text-5xl text-faint" />
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>}
      {action}
    </div>
  );
}

export function Spinner3({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-on-surface-variant">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-line-strong border-t-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
