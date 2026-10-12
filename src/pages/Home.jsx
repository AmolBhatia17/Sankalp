import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { usePublishedCourses } from '../hooks/useData';
import CourseCard from '../components/CourseCard';
import { Icon, Spinner3 } from '../components/ui';

const STAGES = [
  {
    n: '01',
    tag: 'Foundations',
    title: 'Structured lectures',
    detail: 'Video-first modules with transcripts and multi-language subtitles.',
  },
  {
    n: '02',
    tag: 'Applied',
    title: 'Guided labs',
    detail: 'Hands-on labs and downloadable notebooks, datasets and PDFs.',
  },
  {
    n: '03',
    tag: 'Assessment',
    title: 'Competency milestones',
    detail: 'Capstone checkpoints that grade what you can actually build.',
  },
  {
    n: '04',
    tag: 'Outcome',
    title: 'Verified credential',
    detail: 'A shareable completion record anyone can verify.',
  },
];

function CurriculumSpine() {
  return (
    <div className="relative rounded-3xl border border-line bg-card p-6 shadow-xl shadow-primary/5 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-on-surface-variant">
          The Sankalp path
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 text-[11px] font-semibold text-secondary">
          <Icon name="verified" className="text-sm" />
          Accredited
        </span>
      </div>

      <ol className="relative mt-6 space-y-5">
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-primary/50 via-primary/25 to-transparent"
        />
        {STAGES.map((s, i) => (
          <li key={s.n} className="relative flex gap-4">
            <span
              className={`z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold ${
                i === STAGES.length - 1
                  ? 'border-secondary bg-secondary-fill text-white'
                  : 'border-line bg-card text-primary-accent'
              }`}
            >
              {s.n}
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  {s.tag}
                </span>
              </div>
              <p className="font-display text-[15px] font-bold text-on-surface">{s.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-on-surface-variant">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CredentialPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -right-3 -top-3 hidden h-full w-full rounded-3xl border border-line bg-surface-container/50 sm:block"
      />
      <div className="relative rounded-3xl border-4 border-primary/15 bg-cream p-7 shadow-xl">
        <div className="flex items-start justify-between">
          <Icon name="workspace_premium" fill className="text-4xl text-primary-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">
            Example credential
          </span>
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
          Certificate of completion
        </p>
        <p className="mt-2 font-serif text-2xl italic text-on-surface">
          Embedded Systems Engineering
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Distinction · Verified completion
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4 text-xs">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-on-surface-variant">Credential ID</dt>
            <dd className="mt-1 font-mono text-on-surface">SNK-ECE-201-4F2A9C</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-on-surface-variant">Verified by</dt>
            <dd className="mt-1 text-on-surface">Sankalp Academic Office</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default function Home() {
  const courses = usePublishedCourses();
  const { openFellowship } = useUI();

  const list = useMemo(() => courses || [], [courses]);
  const featured = useMemo(() => list.slice(0, 6), [list]);

  const stats = useMemo(() => {
    const disciplines = new Set(list.map((c) => c.discipline).filter(Boolean));
    const lectures = list.reduce((n, c) => n + (c.lecturesCount || 0), 0);
    const students = list.reduce((n, c) => n + (c.enrolledCount || 0), 0);
    return [
      { label: 'Published courses', value: list.length, icon: 'menu_book' },
      { label: 'Disciplines', value: disciplines.size, icon: 'category' },
      { label: 'Lectures', value: lectures, icon: 'play_circle' },
      { label: 'Enrolled learners', value: students, icon: 'group' },
    ];
  }, [list]);

  const trust = [
    { icon: 'verified', label: 'Accredited curricula' },
    { icon: 'all_inclusive', label: 'Lifetime access' },
    { icon: 'shield_lock', label: 'Secure Razorpay checkout' },
  ];

  return (
    <div className="bg-surface">
      {/* Hero — asymmetric, type-led, with the competency path as the proof object */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="animate-in lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-semibold text-primary-accent shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Collegiate-grade learning, built for engineers
            </span>

            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-on-surface sm:text-5xl lg:text-[3.75rem]">
              Lectures and labs you can
              <span className="font-serif font-normal italic text-primary-accent"> actually prove</span>.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-on-surface-variant sm:text-lg">
              Sankalp pairs structured video curricula with hands-on labs and assessed milestones,
              so your progress becomes a verified credential, not just a feeling.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover active:translate-y-px"
              >
                <Icon name="explore" className="text-base" />
                Browse the catalog
              </Link>
              <Link
                to="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-6 py-3.5 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary-accent"
              >
                <Icon name="school" className="text-base" />
                Teach on Sankalp
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {trust.map((t) => (
                <li key={t.label} className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                  <Icon name={t.icon} className="text-base text-secondary" />
                  {t.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-in slide-in-from-top-2 lg:col-span-5">
            <CurriculumSpine />
          </div>
        </div>
      </section>

      {/* Live registry stats — shown only once real courses exist */}
      {list.length > 0 && (
        <section className="border-b border-line bg-card">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-4 sm:px-6 lg:grid-cols-4 lg:divide-x">
            {stats.map((s) => (
              <div key={s.label} className="px-2 py-7 text-center lg:px-6">
                <Icon name={s.icon} className="text-primary-accent" />
                <dd className="mt-2 font-display text-3xl font-extrabold text-on-surface">
                  {s.value.toLocaleString('en-IN')}
                </dd>
                <dt className="mt-0.5 text-sm text-on-surface-variant">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Featured courses — real published data */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-on-surface-variant">
              Academic registry
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Featured courses
            </h2>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
          >
            View full catalog
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        {courses === null ? (
          <Spinner3 label="Loading catalog…" />
        ) : featured.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-line-strong bg-card px-6 py-16 text-center">
            <Icon name="inventory_2" className="text-5xl text-faint" />
            <h3 className="mt-4 font-display text-lg font-bold text-on-surface">
              The catalog is being prepared
            </h3>
            <p className="mt-1 max-w-md text-sm text-on-surface-variant">
              Courses appear here the moment an instructor publishes them. If you teach, you can be
              first.
            </p>
            <Link
              to="/studio"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <Icon name="add" className="text-base" />
              Open Instructor Studio
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Outcomes — the credential artifact */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-on-surface-variant">
              Outcomes
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Finish with proof, not just a playlist
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-on-surface-variant">
              Every course ends in a graded capstone. Clear it and Sankalp issues a verifiable
              credential with a permanent ID you can share with employers or institutions.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Graded capstones, not passive completion',
                'A shareable verification link for each credential',
                'Progress, notes and bookmarks saved to your account',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-on-surface-variant">
                  <Icon name="check_circle" className="mt-0.5 text-base text-secondary" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:pl-8">
            <CredentialPreview />
          </div>
        </div>
      </section>

      {/* Instructor invitation */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-center gap-8 rounded-3xl border border-line bg-surface-low p-8 sm:p-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-on-surface-variant">
              For faculty
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
              Build a course in the Studio
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              Author modules and lectures, upload video and resources with real progress, set
              pricing, and publish straight to the catalog. Your instructor profile appears across
              every course you teach.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <Icon name="video_library" className="text-base" />
              Open Instructor Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Fellowship CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-inverse p-8 text-white sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-secondary-bright">
                <Icon name="school" className="text-sm" />
                Sankalp fellowship
              </span>
              <h2 className="mt-3 max-w-2xl font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Can't cover a course? Apply for a full, partial or lab grant.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Fellowships are open to eligible students across every discipline. Tell us what you
                want to build.
              </p>
            </div>
            <button
              onClick={openFellowship}
              className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#131b2e] transition hover:bg-white/90"
            >
              Apply for a fellowship
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
