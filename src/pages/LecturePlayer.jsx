import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useEnrollment } from '../context/EnrollmentContext';
import { useCourse } from '../hooks/useData';
import { addBookmark, saveNote, subscribeNote } from '../lib/userContent';
import { updateEnrollmentProgress } from '../lib/enrollments';
import { Badge, EmptyState, Icon, ProgressBar, Spinner3 } from '../components/ui';

const fmt = (s) => {
  const sec = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

export default function LecturePlayer() {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const course = useCourse(courseId);
  const { user } = useAuth();
  const { openAuth, openPayment, openOfficeHours, toast } = useUI();
  const { isCourseSubscribed, getEnrollment } = useEnrollment();

  const videoRef = useRef(null);
  const [tab, setTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const allLectures = useMemo(
    () => (course?.modules || []).flatMap((m) => (m.lectures || []).map((l) => ({ ...l, moduleTitle: m.title }))),
    [course]
  );

  const lecture = useMemo(
    () => allLectures.find((l) => l.id === lectureId) || allLectures[0],
    [allLectures, lectureId]
  );

  const index = allLectures.findIndex((l) => l.id === lecture?.id);
  const prev = index > 0 ? allLectures[index - 1] : null;
  const next = index >= 0 && index < allLectures.length - 1 ? allLectures[index + 1] : null;

  const enrolled = isCourseSubscribed(courseId);

  useEffect(() => {
    if (!user || !lecture?.id) return undefined;
    const unsub = subscribeNote(user.uid, lecture.id, (docSnap) => {
      setNoteText(docSnap?.text || '');
    });
    return () => unsub();
  }, [user, lecture?.id]);

  useEffect(() => {
    if (!course || !lecture) return;
    if (!enrolled && !lecture.isFreePreview) return;
    const enrollment = getEnrollment(courseId);
    if (enrollment && enrollment.lastLectureId !== lecture.id) {
      updateEnrollmentProgress(user.uid, courseId, { lastLectureId: lecture.id }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, lecture?.id]);

  if (course === null) return <Spinner3 label="Loading lecture…" />;
  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <EmptyState icon="error" title="Course not found" description="This course is unavailable." />
      </div>
    );
  }
  if (!lecture) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <EmptyState
          icon="hourglass_empty"
          title="No lectures yet"
          description="The instructor has not published any lectures for this course."
          action={
            <Link to={`/courses/${courseId}`} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              Back to course
            </Link>
          }
        />
      </div>
    );
  }

  const locked = !lecture.isFreePreview && !enrolled;
  const completed = getEnrollment(courseId)?.completedLectureIds || [];
  const isComplete = completed.includes(lecture.id);

  const handleBookmark = async () => {
    if (!user) return openAuth();
    await addBookmark(user.uid, {
      title: lecture.title,
      courseId,
      lectureId: lecture.id,
      timestamp: fmt(currentTime),
      timeOffset: currentTime,
      courseTitle: course.title,
    });
    toast('Bookmark saved');
  };

  const toggleComplete = async () => {
    if (!user || !enrolled) return;
    const set = new Set(completed);
    if (set.has(lecture.id)) set.delete(lecture.id);
    else set.add(lecture.id);
    const list = [...set];
    const percent = allLectures.length ? Math.round((list.length / allLectures.length) * 100) : 0;
    await updateEnrollmentProgress(user.uid, courseId, {
      completedLectureIds: list,
      percentDone: percent,
    });
    toast(set.has(lecture.id) ? 'Marked complete' : 'Marked incomplete');
  };

  const handleSaveNote = async () => {
    if (!user) return openAuth();
    setSaving(true);
    try {
      await saveNote(user.uid, lecture.id, noteText);
      toast('Notes saved');
    } finally {
      setSaving(false);
    }
  };

  const enroll = () => {
    if (!user) return openAuth(() => openPayment(course, () => toast('Enrolled!')));
    openPayment(course, () => toast('Enrolled!'));
  };

  const resources = lecture.resources || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary-accent">
        <Icon name="arrow_back" className="text-base" /> {course.title}
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-line bg-black">
            {locked ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-inverse p-6 text-center text-white">
                <Icon name="lock" className="text-5xl text-white/70" />
                <p className="font-display text-lg font-bold">This lecture is locked</p>
                <p className="max-w-sm text-sm text-white/70">
                  Enroll in {course.title} to unlock all lectures, labs and resources.
                </p>
                <button onClick={enroll} className="mt-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold">
                  Enroll to unlock
                </button>
              </div>
            ) : lecture.videoUrl ? (
              <video
                ref={videoRef}
                src={lecture.videoUrl}
                controls
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                className="aspect-video w-full"
                poster={course.thumbnail}
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-inverse text-center text-white/70">
                <Icon name="videocam_off" className="text-5xl" />
                <p className="text-sm">No video uploaded for this lecture yet.</p>
              </div>
            )}
          </div>

          {/* Header + actions */}
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {lecture.moduleTitle}
              </p>
              <h1 className="font-display text-2xl font-bold">
                {lecture.numberStr} · {lecture.title}
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">{lecture.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBookmark}
                disabled={locked}
                className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container px-3 py-2 text-sm font-semibold text-primary-accent transition hover:bg-surface-highest disabled:opacity-50"
              >
                <Icon name="bookmark_add" className="text-base" /> Bookmark {fmt(currentTime)}
              </button>
              {enrolled && (
                <button
                  onClick={toggleComplete}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isComplete
                      ? 'bg-secondary-fill text-white hover:bg-secondary-fill-hover'
                      : 'bg-secondary-container/40 text-secondary hover:bg-secondary-container/60'
                  }`}
                >
                  <Icon name={isComplete ? 'task_alt' : 'check_circle'} className="text-base" />
                  {isComplete ? 'Completed' : 'Mark complete'}
                </button>
              )}
            </div>
          </div>

          {/* Prev / Next */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={() => prev && navigate(`/learn/${courseId}/${prev.id}`)}
              disabled={!prev}
              className="inline-flex items-center gap-1 rounded-xl border border-line bg-card px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-low disabled:opacity-40"
            >
              <Icon name="chevron_left" className="text-base" /> Previous
            </button>
            <button
              onClick={() => next && navigate(`/learn/${courseId}/${next.id}`)}
              disabled={!next}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-40"
            >
              Next <Icon name="chevron_right" className="text-base" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-line">
            <div className="flex gap-4">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'notes', label: 'My notes' },
                { id: 'resources', label: `Resources (${resources.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`-mb-px border-b-2 px-1 pb-2 text-sm font-semibold transition ${
                    tab === t.id
                      ? 'border-primary text-primary-accent'
                      : 'border-transparent text-on-surface-variant hover:text-primary-accent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="py-5">
            {tab === 'overview' && (
              <div className="space-y-3 text-sm text-on-surface-variant">
                <p>{lecture.description}</p>
                {lecture.chapters?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                      Chapters
                    </p>
                    <div className="space-y-1">
                      {lecture.chapters.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            const [m, s] = c.time.split(':').map(Number);
                            if (videoRef.current) videoRef.current.currentTime = m * 60 + (s || 0);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface-low"
                        >
                          <span className="font-mono text-xs text-primary-accent">{c.time}</span>
                          <span className="text-sm text-on-surface">{c.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={openOfficeHours}
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-container px-4 py-2 text-sm font-semibold text-primary-accent"
                >
                  <Icon name="support_agent" className="text-base" /> Ask in office hours
                </button>
              </div>
            )}

            {tab === 'notes' && (
              <div>
                <textarea
                  rows={8}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Take notes for this lecture — they save to your account."
                  className="w-full resize-none rounded-xl border border-line-strong bg-card px-4 py-3 text-sm outline-none focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/30"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={saving || !user}
                  className="mt-3 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save notes'}
                </button>
                {!user && <p className="mt-2 text-xs text-muted">Sign in to save notes.</p>}
              </div>
            )}

            {tab === 'resources' && (
              <div className="space-y-2">
                {resources.length === 0 ? (
                  <p className="text-sm text-muted">No resources attached to this lecture.</p>
                ) : (
                  resources.map((r) => (
                    <a
                      key={r.url || r.name}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-line bg-card p-3 transition hover:bg-surface-low"
                    >
                      <Icon name="description" className="text-primary-accent" />
                      <span className="flex-1 text-sm font-semibold">{r.name}</span>
                      <Icon name="download" className="text-muted" />
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Syllabus sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-line bg-card p-5 shadow-sm">
            <h2 className="font-display font-bold">Course syllabus</h2>
            {enrolled && (
              <div className="mt-3">
                <ProgressBar value={getEnrollment(courseId)?.percentDone || 0} />
                <p className="mt-1 text-xs text-muted">
                  {completed.length}/{allLectures.length} lectures complete
                </p>
              </div>
            )}
            <div className="custom-scrollbar mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {(course.modules || []).map((mod) => (
                <div key={mod.id}>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    {mod.moduleNumber} · {mod.title}
                  </p>
                  <div className="mt-1.5 space-y-0.5">
                    {(mod.lectures || []).map((l) => {
                      const active = l.id === lecture.id;
                      const lecLocked = !l.isFreePreview && !enrolled;
                      return (
                        <button
                          key={l.id}
                          onClick={() =>
                            lecLocked ? enroll() : navigate(`/learn/${courseId}/${l.id}`)
                          }
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                            active ? 'bg-surface-container font-semibold text-primary-accent' : 'hover:bg-surface-low'
                          }`}
                        >
                          <Icon
                            name={lecLocked ? 'lock' : completed.includes(l.id) ? 'task_alt' : 'play_circle'}
                            className={`text-base ${
                              lecLocked ? 'text-faint' : completed.includes(l.id) ? 'text-secondary' : 'text-primary-accent'
                            }`}
                          />
                          <span className="flex-1 truncate">
                            {l.numberStr} · {l.title}
                          </span>
                          {l.isFreePreview && !enrolled && <Badge tone="success">Free</Badge>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
