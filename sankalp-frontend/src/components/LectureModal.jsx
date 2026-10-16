import {
  X,
  Play,
  FileText,
  Video,
  Clock,
  ExternalLink,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export default function LectureModal({
  isOpen,
  onClose,
  item,
  courseTitle,
  moduleTitle,
}) {
  if (!isOpen || !item) return null;

  const isVideo = item.type === 'mp4' || Boolean(item.duration);
  const resourceUrl = item.url || '';

  // Determine embed type
  const isGoogleDrivePreview =
    resourceUrl.includes('drive.google.com') && resourceUrl.includes('/preview');
  const isDirectVideo =
    resourceUrl.endsWith('.mp4') || resourceUrl.includes('commondatastorage');

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0b1120',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '0',
          overflow: 'hidden',
          color: '#f8fafc',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Modal Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            background: '#0f172a',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isVideo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                color: isVideo ? '#38bdf8' : '#34d399',
              }}
            >
              {isVideo ? <Video size={18} /> : <FileText size={18} />}
            </span>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                {courseTitle} &bull; {moduleTitle}
              </span>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: '0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '550px',
                }}
              >
                {item.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Media Player / Document Viewer Stage */}
        <div
          style={{
            background: '#020617',
            position: 'relative',
            width: '100%',
            height: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {resourceUrl ? (
            isGoogleDrivePreview ? (
              <iframe
                src={resourceUrl}
                title={item.title}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : isDirectVideo ? (
              <video
                src={resourceUrl}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : isVideo ? (
              <iframe
                src={resourceUrl}
                title={item.title}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resourceUrl)}&embedded=true`}
                title={item.title}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            )
          ) : (
            /* EdTech Styled Demo Player for when drive URL is pending upload */
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                maxWidth: '480px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: isVideo ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                  color: isVideo ? '#38bdf8' : '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                {isVideo ? <Play size={28} /> : <BookOpen size={28} />}
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
                {isVideo ? 'Module Video Lecture Player' : 'Curriculum Lecture Notes'}
              </h4>

              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {isVideo
                  ? `Lecture file: "${item.file}". This video lecture is registered in the database for ${moduleTitle}.`
                  : `Study material file: "${item.file}". Prepared as comprehensive study slides (.${item.type?.toUpperCase() || 'PPTX'}).`}
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(5, 150, 105, 0.2)',
                  border: '1px solid #059669',
                  color: '#34d399',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={15} />
                <span>Subscribed Access Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#0f172a',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                background: '#1e293b',
                color: '#cbd5e1',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isVideo ? <Clock size={13} /> : <FileText size={13} />}
              {isVideo ? (item.duration || 'Video Session') : `${item.type?.toUpperCase()} Notes`}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              File: <strong style={{ color: '#94a3b8' }}>{item.file}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {resourceUrl && (
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: '#1e293b',
                  color: '#38bdf8',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                <span>Open in Google Drive</span>
                <ExternalLink size={14} />
              </a>
            )}

            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1.25rem',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done Watching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
