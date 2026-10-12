import { Icon } from '../ui';

export default function VideoPreviewModal({ isOpen, onClose, title, url }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse/80 p-4 backdrop-blur-sm animate-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Course trailer"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <span className="truncate text-sm font-semibold">{title || 'Course trailer'}</span>
          <button onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <div className="aspect-video w-full bg-black">
          {url ? (
            <video src={url} controls autoPlay className="h-full w-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/70">
              <Icon name="movie" className="text-6xl" />
              <p className="text-sm">No trailer has been uploaded for this course yet.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-card/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-card/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
