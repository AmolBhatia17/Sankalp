import { useState } from 'react';
import { Icon } from '../ui';

export default function DiplomaModal({ credential, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!credential) return null;

  const verifyUrl = `https://verify.sankalp.edu/${credential.credentialId}`;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse/70 p-4 backdrop-blur-sm animate-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Completion credential"
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-3xl border-4 border-primary/20 bg-cream p-8 shadow-2xl sm:p-12">
          <div className="text-center">
            <Icon name="workspace_premium" fill className="text-5xl text-primary-accent" />
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-muted">
              Sankalp Institute of Technology
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-on-surface">
              Certificate of Completion
            </h2>
            <p className="mt-4 text-sm text-on-surface-variant">This certifies that</p>
            <p className="mt-1 font-display text-2xl font-bold text-primary-accent">
              {credential.recipientName}
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">has successfully completed</p>
            <p className="mt-1 font-display text-xl font-bold text-on-surface">{credential.title}</p>
            <p className="mt-2 inline-block rounded-full bg-secondary-container/40 px-4 py-1 text-sm font-semibold text-secondary">
              {credential.distinction}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 text-xs text-on-surface-variant">
            <div>
              <p className="font-semibold uppercase tracking-wide text-muted">Credential ID</p>
              <p className="mt-1 font-mono">{credential.credentialId}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-muted">Course code</p>
              <p className="mt-1 font-mono">{credential.code}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-muted">Issued</p>
              <p className="mt-1">{credential.dateIssued}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-muted">Verified by</p>
              <p className="mt-1">{credential.verifiedBy}</p>
            </div>
          </div>

          {credential.skills?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {credential.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-primary-accent"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-xl bg-card px-5 py-2.5 text-sm font-semibold text-primary-accent shadow-sm transition hover:bg-surface-low"
          >
            <Icon name={copied ? 'check' : 'link'} className="text-base" />
            {copied ? 'Link copied' : 'Share credential'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <Icon name="download" className="text-base" />
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
