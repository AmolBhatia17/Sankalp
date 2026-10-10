import { Link } from 'react-router-dom';
import { Icon, RatingStars } from './ui';
import { formatINR } from '../lib/format';

export default function CourseCard({ course, isBookmarked = false, onToggleBookmark }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-surface-container">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse/60 to-transparent" />

        {course.levelBadge && (
          <span className="absolute left-3 top-3 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white">
            {course.levelBadge}
          </span>
        )}
        {course.code && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
            {course.code}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-lg bg-card/90 px-2 py-0.5 text-xs font-semibold text-on-surface">
          {course.durationHours}h
        </span>

        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleBookmark(course);
            }}
            className="absolute right-3 top-3 rounded-lg bg-card/90 p-1.5 transition hover:bg-card"
            aria-label="Bookmark course"
          >
            <Icon
              name="bookmark"
              fill={isBookmarked}
              className={isBookmarked ? 'text-primary-accent' : 'text-on-surface-variant'}
            />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {course.discipline}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug">{course.title}</h3>

        <div className="mt-2 flex items-center gap-2">
          <RatingStars rating={course.rating} />
          <span className="text-xs text-on-surface-variant">
            {course.rating ? course.rating.toFixed(1) : 'New'} · {course.lecturesCount || 0} lectures
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">{course.description}</p>

        {course.specialBadge && (
          <span className="mt-3 w-fit rounded-lg bg-surface-low px-2.5 py-1 text-xs font-semibold text-primary-accent">
            {course.specialBadge}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <span className="font-display text-lg font-bold text-on-surface">
              {formatINR(course.price)}
            </span>
            {course.originalPrice > course.price && (
              <span className="ml-2 text-xs text-muted line-through">
                {formatINR(course.originalPrice)}
              </span>
            )}
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center gap-1 rounded-xl bg-surface-container px-4 py-2 text-sm font-semibold text-primary-accent transition hover:bg-primary hover:text-white"
          >
            View Syllabus
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </div>
    </div>
  );
}
