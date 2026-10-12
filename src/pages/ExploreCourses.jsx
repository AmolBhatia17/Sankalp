import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useBookmarks, usePublishedCourses } from '../hooks/useData';
import { addBookmark, deleteBookmark } from '../lib/userContent';
import CourseCard from '../components/CourseCard';
import { EmptyState, Icon, Spinner3 } from '../components/ui';

const DURATIONS = [
  { id: 'any', label: 'Any duration' },
  { id: 'short', label: 'Under 20 hours' },
  { id: 'medium', label: '20 – 30 hours' },
  { id: 'long', label: '30+ hours' },
];

const SORTS = [
  { id: 'popular', label: 'Most enrolled' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

export default function ExploreCourses() {
  const courses = usePublishedCourses();
  const { user } = useAuth();
  const { openAuth, openFellowship } = useUI();
  const bookmarks = useBookmarks(user?.uid) || [];
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';

  const [disciplines, setDisciplines] = useState([]);
  const [levels, setLevels] = useState([]);
  const [duration, setDuration] = useState('any');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [view, setView] = useState('grid');

  const list = useMemo(() => courses || [], [courses]);

  const disciplineCounts = useMemo(() => {
    const map = {};
    list.forEach((c) => {
      if (!c.discipline) return;
      map[c.discipline] = (map[c.discipline] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [list]);

  const levelCounts = useMemo(() => {
    const map = {};
    list.forEach((c) => {
      if (!c.level) return;
      map[c.level] = (map[c.level] || 0) + 1;
    });
    return Object.entries(map);
  }, [list]);

  const toggle = (setter, value) =>
    setter((arr) => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]));

  const filtered = useMemo(() => {
    let out = list.slice();

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.discipline?.toLowerCase().includes(q) ||
          c.code?.toLowerCase().includes(q)
      );
    }
    if (disciplines.length) out = out.filter((c) => disciplines.includes(c.discipline));
    if (levels.length) out = out.filter((c) => levels.includes(c.level));
    if (minRating > 0) out = out.filter((c) => (c.rating || 0) >= minRating);

    if (duration !== 'any') {
      out = out.filter((c) => {
        const h = c.durationHours || 0;
        if (duration === 'short') return h < 20;
        if (duration === 'medium') return h >= 20 && h <= 30;
        return h > 30;
      });
    }

    const sorters = {
      popular: (a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0),
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      newest: (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      'price-asc': (a, b) => (a.price || 0) - (b.price || 0),
      'price-desc': (a, b) => (b.price || 0) - (a.price || 0),
    };
    return out.sort(sorters[sortBy] || sorters.popular);
  }, [list, searchTerm, disciplines, levels, minRating, duration, sortBy]);

  const isBookmarked = (courseId) => bookmarks.some((b) => b.courseId === courseId);

  const handleToggleBookmark = async (course) => {
    if (!user) {
      openAuth();
      return;
    }
    const existing = bookmarks.find((b) => b.courseId === course.id);
    if (existing) {
      await deleteBookmark(user.uid, existing.id);
    } else {
      await addBookmark(user.uid, {
        title: course.title,
        courseId: course.id,
        lectureId: '',
        timestamp: '00:00',
        timeOffset: 0,
        courseTitle: course.title,
      });
    }
  };

  const applySearch = (value) => {
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  const resetFilters = () => {
    setDisciplines([]);
    setLevels([]);
    setDuration('any');
    setMinRating(0);
    setSortBy('popular');
    applySearch('');
  };

  const trending = ['Machine Learning', 'Embedded', 'CAD', 'SLAM', 'RTOS'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Catalog header */}
      <section className="border-b border-line pb-8 pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted">
          <Link to="/" className="transition hover:text-primary-accent">
            Home
          </Link>
          <Icon name="chevron_right" className="text-base" />
          <span className="text-on-surface">Catalog</span>
        </nav>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Course catalog
            </h1>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              Filter by discipline, level, duration and rating to find the right track.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex w-full items-center gap-2 rounded-2xl border border-line bg-card p-1.5 shadow-sm lg:max-w-md"
          >
            <Icon name="search" className="ml-2 text-muted" />
            <input
              value={searchTerm}
              onChange={(e) => applySearch(e.target.value)}
              placeholder="Search courses or disciplines…"
              className="flex-1 bg-transparent px-1 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Trending</span>
          {trending.map((t) => (
            <button
              key={t}
              onClick={() => applySearch(t)}
              className="rounded-full border border-line bg-card px-3 py-1 text-sm text-on-surface-variant transition hover:border-primary hover:text-primary-accent"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section className="grid gap-8 pb-16 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-24 rounded-2xl border border-line bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold">Filter curriculum</h2>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-primary-accent hover:underline"
              >
                Reset all
              </button>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Discipline</p>
              <div className="space-y-1.5">
                {disciplineCounts.map(([name, count]) => (
                  <label key={name} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={disciplines.includes(name)}
                      onChange={() => toggle(setDisciplines, name)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="flex-1">{name}</span>
                    <span className="text-xs text-muted">{count}</span>
                  </label>
                ))}
                {disciplineCounts.length === 0 && (
                  <p className="text-sm text-muted">No disciplines yet.</p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Skill level</p>
              <div className="grid grid-cols-1 gap-1.5">
                {levelCounts.map(([name, count]) => (
                  <label key={name} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={levels.includes(name)}
                      onChange={() => toggle(setLevels, name)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="flex-1">{name}</span>
                    <span className="text-xs text-muted">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Duration</p>
              <div className="space-y-1.5">
                {DURATIONS.map((d) => (
                  <label key={d.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="duration"
                      checked={duration === d.id}
                      onChange={() => setDuration(d.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                Academic rating
              </p>
              <div className="space-y-1.5">
                {[4.5, 4, 3.5, 0].map((r) => (
                  <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r}
                      onChange={() => setMinRating(r)}
                      className="h-4 w-4 accent-primary"
                    />
                    {r === 0 ? 'Any rating' : `${r}+ stars`}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Showing <strong>{filtered.length}</strong> of {list.length} courses
            </p>
            <div className="flex items-center gap-2">
              <select
                aria-label="Sort courses"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="flex rounded-xl bg-surface-low p-1">
                {['grid', 'list'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`rounded-lg p-1.5 ${
                      view === v ? 'bg-card text-primary-accent shadow-sm' : 'text-muted'
                    }`}
                    aria-label={`${v} view`}
                  >
                    <Icon name={v === 'grid' ? 'grid_view' : 'view_list'} className="text-xl" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {courses === null ? (
            <Spinner3 label="Loading catalog…" />
          ) : list.length === 0 ? (
            <EmptyState
              icon="inventory_2"
              title="No courses published yet"
              description="The catalog fills up as instructors publish courses. If you teach, you can create the first one."
              action={
                <Link
                  to="/studio"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  <Icon name="add" className="text-base" />
                  Open Instructor Studio
                </Link>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="No courses match your filters"
              description="Try clearing your filters or searching for a different topic."
              action={
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-xl bg-surface-container px-5 py-2.5 text-sm font-semibold text-primary-accent transition hover:bg-surface-highest"
                >
                  Reset filters
                </button>
              }
            />
          ) : (
            <div
              className={
                view === 'grid'
                  ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-4'
              }
            >
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isBookmarked={isBookmarked(course.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          )}

          <div className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-hover p-8 text-white sm:p-12">
            <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
              Can't afford a course? Apply for a fellowship.
            </h3>
            <p className="mt-2 max-w-xl text-white/80">
              Full, partial and lab grants are available to eligible students across all disciplines.
            </p>
            <button
              onClick={openFellowship}
              className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#3525cd] transition hover:bg-white/90"
            >
              Apply for a fellowship
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
