import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useEnrollment } from '../context/EnrollmentContext';
import { useCourse, useReviews } from '../hooks/useData';
import { Badge, EmptyState, Icon, ProgressBar, RatingStars, Spinner3 } from '../components/ui';
import { formatINR } from '../lib/format';

export default function CourseOverview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = useCourse(courseId);
  const reviewsData = useReviews(courseId);
  const reviews = useMemo(() => reviewsData || [], [reviewsData]);
  const { user } = useAuth();
  const { openAuth, openPayment, openVideo, openReview, toast } = useUI();
  const { isCourseSubscribed } = useEnrollment();

  const [expanded, setExpanded] = useState({});

  const enrolled = isCourseSubscribed(courseId);

  const breakdown = useMemo(() => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const k = Math.round(r.rating);
      if (buckets[k] !== undefined) buckets[k] += 1;
    });
    return buckets;
  }, [reviews]);

  if (course === null) {
    return <Spinner3 label="Loading course…" />;
  }
  if (course === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <EmptyState
          icon="error"
          title="Course not found"
          description="This course may have been removed or is not published."
          action={
            <Link
              to="/courses"
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to catalog
            </Link>
          }
        />
      </div>
    );
  }

  const firstFreeLecture = course.modules
    ?.flatMap((m) => m.lectures || [])
    .find((l) => l.isFreePreview);

  const toggleModule = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const openLecture = (lecture) => {
    if (lecture.isFreePreview || enrolled) {
      navigate(`/learn/${course.id}/${lecture.id}`);
    } else if (!user) {
      openAuth();
    } else {
      openPayment(course, () => {
        toast('Enrolled — enjoy the course!');
        navigate(`/learn/${course.id}/${lecture.id}`);
      });
    }
  };

  const handleEnroll = () => {
    if (!user) {
      openAuth(() => openPayment(course, () => toast('Enrolled successfully!')));
      return;
    }
    openPayment(course, () => {
      toast('Enrolled successfully!');
      navigate('/my-learning');
    });
  };

  const totalReviews = reviews.length || course.reviewsCount || 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-line bg-surface-low">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-on-surface-variant sm:px-6">
          <Link to="/courses" className="hover:text-primary-accent">
            Catalog
          </Link>
          <Icon name="chevron_right" className="text-base text-faint" />
          <span className="text-on-surface">{course.title}</span>
          <span className="ml-auto hidden items-center gap-1 rounded-full bg-secondary-container/40 px-3 py-1 text-xs font-semibold text-secondary sm:inline-flex">
            <Icon name="verified" className="text-sm" /> Accredited {course.code}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-8">
            <Badge tone="primary">{course.discipline}</Badge>
            <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
            <p className="mt-4 text-lg text-on-surface-variant">{course.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <RatingStars rating={course.rating} /> {course.rating ? course.rating.toFixed(1) : 'New'}
                <span className="text-muted">({totalReviews})</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="group" className="text-base text-primary-accent" />
                {(course.enrolledCount || 0).toLocaleString('en-IN')} enrolled
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="play_circle" className="text-base text-primary-accent" />
                {course.lecturesCount || 0} lectures · {course.durationHours}h
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="update" className="text-base text-primary-accent" />
                Updated {course.lastUpdated}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(course.highlightPills || []).map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-on-surface-variant"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* Milestones */}
            {course.milestones?.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-xl font-bold">Competency milestones</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {course.milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-2xl border bg-card p-4 shadow-sm ${
                        m.isCapstone ? 'border-primary/40' : 'border-line'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted">{m.step}</span>
                        <Badge tone={m.isCapstone ? 'success' : 'neutral'}>{m.tag}</Badge>
                      </div>
                      <h3 className="mt-2 font-display font-bold">{m.title}</h3>
                      <p className="mt-1 text-xs text-on-surface-variant">{m.description}</p>
                      <ProgressBar value={m.progressPercent || 0} className="mt-3" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Curriculum */}
            <section className="mt-10">
              <h2 className="font-display text-xl font-bold">Curriculum</h2>
              <div className="mt-4 space-y-3">
                {(course.modules || []).map((mod) => {
                  const isOpen = expanded[mod.id] ?? false;
                  return (
                    <div key={mod.id} className="overflow-hidden rounded-2xl border border-line bg-card">
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-surface-low"
                      >
                        <Icon
                          name="expand_more"
                          className={`text-on-surface-variant transition ${isOpen ? 'rotate-180' : ''}`}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                            {mod.moduleNumber}
                          </p>
                          <h3 className="font-display font-bold">{mod.title}</h3>
                        </div>
                        <span className="hidden text-xs text-muted sm:block">
                          {mod.lecturesCount} lectures · {mod.durationStr}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-line">
                          {(mod.lectures || []).map((lec) => {
                            const locked = !lec.isFreePreview && !enrolled;
                            return (
                              <button
                                key={lec.id}
                                onClick={() => openLecture(lec)}
                                className="flex w-full items-center gap-3 border-b border-line/60 px-4 py-3 text-left transition last:border-0 hover:bg-surface-low"
                              >
                                <Icon
                                  name={locked ? 'lock' : 'play_circle'}
                                  className={locked ? 'text-faint' : 'text-primary-accent'}
                                />
                                <span className="flex-1">
                                  <span className="block text-sm font-semibold">
                                    {lec.numberStr} · {lec.title}
                                  </span>
                                  <span className="block text-xs text-muted">
                                    {lec.type} · {lec.durationMinutes} min
                                  </span>
                                </span>
                                {lec.isFreePreview && (
                                  <Badge tone="success">Free preview</Badge>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!course.modules || course.modules.length === 0) && (
                  <p className="rounded-2xl border border-dashed border-line-strong bg-card p-6 text-center text-sm text-muted">
                    Curriculum is being finalised.
                  </p>
                )}
              </div>
            </section>

            {/* Instructor */}
            {course.instructor?.name && (
              <section className="mt-10">
                <h2 className="font-display text-xl font-bold">Instructor</h2>
                <div className="mt-4 flex flex-col gap-5 rounded-2xl border border-line bg-card p-6 sm:flex-row">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-display text-lg font-bold">{course.instructor.name}</h3>
                    <p className="text-sm text-on-surface-variant">
                      {course.instructor.role} · {course.instructor.affiliation}
                    </p>
                    {course.instructor.phd && (
                      <p className="mt-1 text-xs text-muted">{course.instructor.phd}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="menu_book" className="text-sm text-primary-accent" />
                        {course.instructor.coursesCount || 0} courses
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="group" className="text-sm text-primary-accent" />
                        {course.instructor.studentsCount || 0} students
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="star" fill className="text-sm text-gold" />
                        {course.instructor.rating || '—'}
                      </span>
                    </div>
                    {(course.instructor.bio || []).map((b) => (
                      <p key={b} className="mt-2 text-sm text-on-surface-variant">
                        {b}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Student reviews</h2>
                <button
                  onClick={() => openReview({ courseId: course.id, courseTitle: course.title })}
                  className="rounded-xl bg-surface-container px-4 py-2 text-sm font-semibold text-primary-accent transition hover:bg-primary hover:text-white"
                >
                  Write a review
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-card p-5 text-center">
                  <p className="font-display text-4xl font-extrabold text-primary-accent">
                    {course.rating ? course.rating.toFixed(1) : '—'}
                  </p>
                  <RatingStars rating={course.rating} className="mt-1 justify-center" />
                  <p className="mt-1 text-xs text-muted">{totalReviews} verified reviews</p>
                </div>
                <div className="rounded-2xl border border-line bg-card p-5 sm:col-span-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = totalReviews ? (breakdown[star] / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="mb-1.5 flex items-center gap-2 text-xs">
                        <span className="w-6 text-muted">{star}★</span>
                        <ProgressBar value={pct} barClassName="bg-gold" />
                        <span className="w-8 text-right text-muted">{breakdown[star]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {reviews.slice(0, 6).map((r) => (
                  <div key={r.id} className="rounded-2xl border border-line bg-card p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{r.authorName}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">{r.quote}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-line-strong bg-card p-6 text-center text-sm text-muted">
                    No reviews yet — be the first to share your experience.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right column — enroll card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-line bg-card p-5 shadow-xl">
              <button
                onClick={() =>
                  openVideo({
                    title: course.title,
                    url: firstFreeLecture?.videoUrl || course.trailerUrl || '',
                  })
                }
                className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-surface-container"
              >
                <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/40">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                    <Icon name="play_arrow" fill className="text-3xl" />
                  </span>
                </span>
              </button>

              <div className="mt-5 flex items-end gap-3">
                <span className="font-display text-3xl font-extrabold text-on-surface">
                  {formatINR(course.price)}
                </span>
                {course.originalPrice > course.price && (
                  <>
                    <span className="text-sm text-muted line-through">
                      {formatINR(course.originalPrice)}
                    </span>
                    <Badge tone="success">{course.academicGrantPercent}% grant</Badge>
                  </>
                )}
              </div>

              {enrolled ? (
                <button
                  onClick={() => navigate(`/learn/${course.id}/${firstFreeLecture?.id || ''}`)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-fill px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary-fill-hover"
                >
                  <Icon name="play_circle" fill className="text-base" /> Continue learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover active:translate-y-0.5"
                >
                  <Icon name="school" className="text-base" /> Enroll now
                </button>
              )}

              {firstFreeLecture && (
                <button
                  onClick={() => navigate(`/learn/${course.id}/${firstFreeLecture.id}`)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-surface-high px-4 py-3 text-sm font-semibold text-primary-accent transition hover:bg-surface-highest"
                >
                  <Icon name="play_circle" className="text-base" /> Preview free lesson
                </button>
              )}

              <p className="mt-4 text-center text-xs text-muted">
                Lifetime access · {course.subtitles?.length || 0} subtitle tracks · 30-day guarantee
              </p>

              <div className="mt-5 border-t border-line pt-5">
                <h3 className="text-sm font-bold">Academic prerequisites</h3>
                <ul className="mt-2 space-y-2">
                  {(course.prerequisites || []).map((p) => (
                    <li key={p.title} className="flex gap-2 text-xs text-on-surface-variant">
                      <Icon name="check_circle" className="text-sm text-secondary" />
                      <span>
                        <strong className="text-on-surface">{p.title}</strong> — {p.desc}
                      </span>
                    </li>
                  ))}
                </ul>

                {course.technologies?.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-bold">Technologies</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {course.technologies.map((t) => (
                        <span
                          key={t}
                          className="rounded-lg bg-surface-low px-2 py-1 text-xs font-medium text-primary-accent"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {course.accreditationNote && (
                  <p className="mt-4 rounded-xl bg-surface-container p-3 text-xs text-primary-accent">
                    <Icon name="workspace_premium" className="mr-1 text-sm" />
                    {course.accreditationNote}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-card/95 p-4 backdrop-blur-xl lg:hidden">
        <div>
          <p className="font-display text-xl font-extrabold">{formatINR(course.price)}</p>
          <p className="text-xs text-muted">{course.lecturesCount} lectures · {course.durationHours}h</p>
        </div>
        <button
          onClick={enrolled ? () => navigate('/my-learning') : handleEnroll}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          {enrolled ? 'Continue' : 'Enroll now'}
        </button>
      </div>
    </div>
  );
}
