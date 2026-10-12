import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useEnrollment } from '../context/EnrollmentContext';
import { useAllCourses, useCredentials } from '../hooks/useData';
import { addCredential } from '../lib/userContent';
import { Badge, EmptyState, Icon, ProgressBar, Spinner3 } from '../components/ui';
import { initialsOf } from '../lib/format';

export default function MyLearning() {
  const { user, displayName, role } = useAuth();
  const { openAuth, openDiploma, openOfficeHours } = useUI();
  const { enrollments, loading } = useEnrollment();
  const courses = useAllCourses() || [];
  const credentials = useCredentials(user?.uid) || [];
  const navigate = useNavigate();

  const byId = Object.fromEntries(courses.map((c) => [c.id, c]));

  // Issue a credential when a course reaches 100% completion.
  useEffect(() => {
    if (!user) return;
    enrollments
      .filter((e) => (e.percentDone || 0) >= 100)
      .forEach((e) => {
        const exists = credentials.some((c) => c.courseId === e.courseId);
        if (exists) return;
        const course = byId[e.courseId];
        addCredential(user.uid, {
          courseId: e.courseId,
          code: course?.code || '',
          title: course?.title || 'Course',
          distinction: 'Distinction — Verified Completion',
          dateIssued: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          credentialId: `SNK-${e.courseId}-${user.uid.slice(0, 6)}`.toUpperCase(),
          verifiedBy: course?.instructor?.name || 'Sankalp Academic Office',
          recipientName: displayName || user.email || 'Learner',
          skills: course?.technologies || [],
        }).catch(() => {});
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments, credentials, user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <EmptyState
          icon="lock"
          title="Sign in to view My Learning"
          description="Track your progress, resume lectures and collect credentials."
          action={
            <button
              onClick={() => openAuth()}
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Sign in
            </button>
          }
        />
      </div>
    );
  }

  const totalCompleted = enrollments.reduce(
    (sum, e) => sum + (e.completedLectureIds?.length || 0),
    0
  );
  const hoursWatched =
    Math.round(
      enrollments.reduce((sum, e) => sum + (((e.percentDone || 0) / 100) * (byId[e.courseId]?.durationHours || 0)), 0) * 10
    ) / 10;

  const stats = [
    { label: 'Active courses', value: enrollments.length, icon: 'school' },
    { label: 'Lectures completed', value: totalCompleted, icon: 'task_alt' },
    { label: 'Hours watched', value: hoursWatched, icon: 'schedule' },
    { label: 'Credentials', value: credentials.length, icon: 'workspace_premium' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed font-display text-lg font-bold text-primary-accent">
            {initialsOf(displayName || user.email)}
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">
              Welcome back, {(displayName || user.email || 'Learner').split(' ')[0]}
            </h1>
            <p className="text-sm text-on-surface-variant">
              You're signed in as{' '}
              <Badge tone={role === 'instructor' ? 'success' : 'primary'}>{role}</Badge>
            </p>
          </div>
        </div>
        <button
          onClick={openOfficeHours}
          className="inline-flex items-center gap-2 rounded-xl bg-surface-container px-4 py-2.5 text-sm font-semibold text-primary-accent transition hover:bg-surface-highest"
        >
          <Icon name="event" className="text-base" /> Book office hours
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-card p-5">
            <Icon name={s.icon} className="text-primary-accent" />
            <p className="mt-3 font-display text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <h2 className="font-display text-xl font-bold">My courses</h2>

          {loading ? (
            <Spinner3 label="Loading your courses…" />
          ) : enrollments.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon="school"
                title="You're not enrolled yet"
                description="Browse the catalog and enroll in your first course."
                action={
                  <Link
                    to="/courses"
                    className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Explore courses
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {enrollments.map((e) => {
                const course = byId[e.courseId];
                const total = course
                  ? (course.modules || []).reduce((n, m) => n + (m.lectures?.length || 0), 0)
                  : 0;
                return (
                  <div
                    key={e.id}
                    className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-4 sm:flex-row"
                  >
                    {course?.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt=""
                        className="h-24 w-full rounded-xl object-cover sm:w-40"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {course?.code || e.courseId}
                      </p>
                      <h3 className="font-display font-bold">{course?.title || 'Course'}</h3>
                      <div className="mt-2">
                        <ProgressBar value={e.percentDone || 0} />
                        <p className="mt-1 text-xs text-muted">
                          {e.completedLectureIds?.length || 0}/{total} lectures · {e.percentDone || 0}%
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => navigate(`/learn/${e.courseId}/${e.lastLectureId || ''}`)}
                          className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                        >
                          <Icon name="play_circle" className="text-base" /> Continue
                        </button>
                        <Link
                          to={`/courses/${e.courseId}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-surface-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="lg:col-span-4">
          <h2 className="font-display text-xl font-bold">Credentials</h2>
          {credentials.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line-strong bg-card p-6 text-center text-sm text-muted">
              Complete a course to earn a verified credential.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {credentials.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openDiploma(c)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card p-4 text-left transition hover:shadow-md"
                >
                  <Icon name="workspace_premium" fill className="text-3xl text-primary-accent" />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{c.title}</span>
                    <span className="block text-xs text-muted">{c.dateIssued}</span>
                  </span>
                  <Icon name="open_in_new" className="text-muted" />
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
