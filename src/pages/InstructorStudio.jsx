import { useEffect, useMemo, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useAllCourses } from '../hooks/useData';
import { createCourse, updateCourse, setCourseStatus } from '../lib/courses';
import { uploadAvatar, uploadCourseThumbnail, uploadLectureVideo, uploadLectureResource, formatBytes } from '../lib/uploads';
import { Badge, EmptyState, Icon } from '../components/ui';
import { formatINR } from '../lib/format';

const DISCIPLINES = ['Electronics', 'Mechanical', 'Computer Science', 'Mathematics', 'Physics', 'Security'];
const LEVELS = ['Foundational', 'Intermediate', 'Graduate / Advanced'];

export default function InstructorStudio() {
  const { user, role, displayName, photoURL, profile, saveProfile } = useAuth();
  const { toast } = useUI();
  const allCourses = useAllCourses();

  const myCourses = useMemo(
    () => (allCourses || []).filter((c) => c.instructorId === user?.uid),
    [allCourses, user]
  );

  const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState('curriculum');
  const [busy, setBusy] = useState('');
  const [upload, setUpload] = useState(null); // {lectureId, percent, name}
  const [avatarUpload, setAvatarUpload] = useState(null);
  const [thumbUpload, setThumbUpload] = useState(null);

  const avatarInput = useRef(null);
  const thumbInput = useRef(null);
  const videoInputs = useRef({});
  const resourceInputs = useRef({});

  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    return onSnapshot(doc(db, 'instructors', user.uid), (snap) =>
      setInstructor(snap.exists() ? snap.data() : null)
    );
  }, [user]);

  const selected = myCourses.find((c) => c.id === selectedId) || myCourses[0] || null;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <EmptyState icon="lock" title="Sign in to open the Studio" description="Instructor tools require an account." />
      </div>
    );
  }

  if (role !== 'instructor') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <EmptyState
          icon="school"
          title="Switch to Instructor mode"
          description="Use the account menu in the top-right and choose “Switch to Instructor” to access the Studio."
        />
      </div>
    );
  }

  const persistModules = (modules) => updateCourse(selected.id, { modules });

  const handleCreateCourse = async () => {
    setBusy('create');
    try {
      const id = await createCourse({
        title: 'Untitled course',
        code: '',
        discipline: DISCIPLINES[0],
        level: LEVELS[0],
        levelBadge: '',
        price: 0,
        originalPrice: 0,
        academicGrantPercent: 0,
        durationHours: 0,
        lecturesCount: 0,
        description: '',
        lastUpdated: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        subtitles: ['English'],
        highlightPills: [],
        technologies: [],
        prerequisites: [],
        milestones: [],
        modules: [],
        instructorId: user.uid,
        instructor: {
          name: displayName || 'Instructor',
          role: 'Instructor',
          affiliation: '',
          avatar: photoURL || '',
          bio: [],
        },
      });
      setSelectedId(id);
      setTab('details');
      toast('Draft course created');
    } catch (e) {
      console.error(e);
      toast('Could not create course');
    } finally {
      setBusy('');
    }
  };

  const saveCourseField = (field, value) => {
    if (!selected) return;
    updateCourse(selected.id, { [field]: value }).catch(() => toast('Save failed'));
  };

  const saveInstructorField = (field, value) => {
    setDoc(
      doc(db, 'instructors', user.uid),
      { [field]: value, updatedAt: serverTimestamp() },
      { merge: true }
    ).catch(() => toast('Save failed'));
  };

  const saveDisplayName = async (value) => {
    await saveProfile({ displayName: value });
    saveInstructorField('name', value);
  };

  const handleAvatar = async (file) => {
    if (!file) return;
    try {
      const { url } = await uploadAvatar(user.uid, file, (percent) => setAvatarUpload(percent));
      await saveProfile({ photoURL: url, displayName: profile?.displayName || displayName });
      await setDoc(
        doc(db, 'instructors', user.uid),
        { name: displayName || '', avatarUrl: url, updatedAt: serverTimestamp() },
        { merge: true }
      );
      toast('Profile photo updated');
    } catch (e) {
      console.error(e);
      toast('Upload failed');
    } finally {
      setAvatarUpload(null);
    }
  };

  const handleThumbnail = async (file) => {
    if (!file || !selected) return;
    try {
      const { url } = await uploadCourseThumbnail(selected.id, file, (percent) => setThumbUpload(percent));
      await updateCourse(selected.id, { thumbnail: url });
      toast('Thumbnail updated');
    } catch (e) {
      console.error(e);
      toast('Upload failed');
    } finally {
      setThumbUpload(null);
    }
  };

  const addModule = () => {
    const modules = [...(selected.modules || [])];
    const n = modules.length + 1;
    modules.push({
      id: `mod-${Date.now()}`,
      moduleNumber: `Module ${String(n).padStart(2, '0')}`,
      title: `New module ${n}`,
      lecturesCount: 0,
      durationStr: '0h 0m',
      lectures: [],
    });
    persistModules(modules).catch(() => toast('Save failed'));
  };

  const addLecture = (moduleId) => {
    const modules = (selected.modules || []).map((m) => {
      if (m.id !== moduleId) return m;
      const n = (m.lectures || []).length + 1;
      const lectures = [
        ...(m.lectures || []),
        {
          id: `lec-${Date.now()}`,
          numberStr: `${m.moduleNumber.replace(/\D/g, '') || '1'}.${n}`,
          title: `New lecture ${n}`,
          description: '',
          durationMinutes: 0,
          type: 'video',
          isFreePreview: false,
          chapters: [],
          resources: [],
        },
      ];
      return { ...m, lectures, lecturesCount: lectures.length };
    });
    persistModules(modules).catch(() => toast('Save failed'));
  };

  const patchLecture = (moduleId, lectureId, patch) => {
    const modules = (selected.modules || []).map((m) =>
      m.id === moduleId
        ? { ...m, lectures: (m.lectures || []).map((l) => (l.id === lectureId ? { ...l, ...patch } : l)) }
        : m
    );
    return persistModules(modules);
  };

  const removeLecture = (moduleId, lectureId) => {
    const modules = (selected.modules || []).map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lectures: (m.lectures || []).filter((l) => l.id !== lectureId),
            lecturesCount: (m.lectures || []).filter((l) => l.id !== lectureId).length,
          }
        : m
    );
    persistModules(modules).catch(() => toast('Save failed'));
  };

  const handleVideo = async (moduleId, lecture, file) => {
    if (!file) return;
    setUpload({ lectureId: lecture.id, percent: 0, name: file.name, size: file.size });
    try {
      const { url } = await uploadLectureVideo(selected.id, lecture.id, file, (percent) =>
        setUpload((u) => ({ ...u, percent }))
      );
      await patchLecture(moduleId, lecture.id, { videoUrl: url });
      toast('Lecture video uploaded');
    } catch (e) {
      console.error(e);
      toast('Video upload failed');
    } finally {
      setUpload(null);
    }
  };

  const handleResource = async (moduleId, lecture, file) => {
    if (!file) return;
    try {
      const { url } = await uploadLectureResource(selected.id, lecture.id, file, () => {});
      const resources = [...(lecture.resources || []), { name: file.name, url }];
      await patchLecture(moduleId, lecture.id, { resources });
      toast('Resource attached');
    } catch (e) {
      console.error(e);
      toast('Resource upload failed');
    }
  };

  const publish = async () => {
    setBusy('publish');
    try {
      const hasLecture = (selected.modules || []).some((m) => (m.lectures || []).length > 0);
      if (!hasLecture) {
        toast('Add at least one lecture before publishing');
        return;
      }
      const lecturesCount = (selected.modules || []).reduce((n, m) => n + (m.lectures?.length || 0), 0);
      await updateCourse(selected.id, { lecturesCount });
      await setCourseStatus(selected.id, 'published');
      toast('Course published to the catalog');
    } catch (e) {
      console.error(e);
      toast('Publish failed');
    } finally {
      setBusy('');
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line-strong bg-card px-3 py-2 text-sm outline-none focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/30';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Instructor Studio</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Author courses, upload lectures and publish to the catalog.</p>
        </div>
        <button
          onClick={handleCreateCourse}
          disabled={busy === 'create'}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          <Icon name="add" className="text-base" /> New course
        </button>
      </div>

      {myCourses.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="video_library"
            title="No courses yet"
            description="Create your first course to start authoring lectures and uploading videos."
            action={
              <button
                onClick={handleCreateCourse}
                className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
              >
                Create a course
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap gap-2">
              {myCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    selected?.id === c.id
                      ? 'bg-primary text-white'
                      : 'bg-surface-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {c.title || 'Untitled'}
                </button>
              ))}
            </div>

            {selected && (
              <>
                <div className="mt-5 flex items-center gap-2">
                  <Badge tone={selected.status === 'published' ? 'success' : 'warn'}>
                    {selected.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                  <span className="font-mono text-xs text-muted">{selected.code || 'no-code'}</span>
                </div>

                <div className="mt-4 border-b border-line">
                  <div className="flex gap-4">
                    {[
                      { id: 'curriculum', label: 'Curriculum' },
                      { id: 'details', label: 'Course details' },
                      { id: 'profile', label: 'Instructor profile' },
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
                  {tab === 'curriculum' && (
                    <div className="space-y-4">
                      <button
                        onClick={addModule}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container px-4 py-2 text-sm font-semibold text-primary-accent"
                      >
                        <Icon name="playlist_add" className="text-base" /> Add module
                      </button>

                      {(selected.modules || []).map((mod) => (
                        <div key={mod.id} className="rounded-2xl border border-line bg-card p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-display font-bold">
                              {mod.moduleNumber} · {mod.title}
                            </p>
                            <button
                              onClick={() => addLecture(mod.id)}
                              className="text-xs font-semibold text-primary-accent hover:underline"
                            >
                              + Add lecture
                            </button>
                          </div>

                          <div className="mt-3 space-y-2">
                            {(mod.lectures || []).map((lec) => (
                              <div key={lec.id} className="rounded-xl border border-line bg-surface p-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    value={lec.title}
                                    onChange={(e) => patchLecture(mod.id, lec.id, { title: e.target.value })}
                                    className={`${inputCls} flex-1`}
                                  />
                                  <button
                                    onClick={() => removeLecture(mod.id, lec.id)}
                                    className="rounded-lg p-2 text-error transition hover:bg-error-container/50"
                                    aria-label="Delete lecture"
                                  >
                                    <Icon name="delete" />
                                  </button>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                                  <label className="inline-flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={!!lec.isFreePreview}
                                      onChange={(e) =>
                                        patchLecture(mod.id, lec.id, { isFreePreview: e.target.checked })
                                      }
                                      className="h-4 w-4 accent-primary"
                                    />
                                    Free preview
                                  </label>

                                  <button
                                    onClick={() => videoInputs.current[lec.id]?.click()}
                                    className="inline-flex items-center gap-1 font-semibold text-primary-accent hover:underline"
                                  >
                                    <Icon name="upload" className="text-sm" />
                                    {lec.videoUrl ? 'Replace video' : 'Upload video'}
                                  </button>
                                  <input
                                    ref={(el) => (videoInputs.current[lec.id] = el)}
                                    type="file"
                                    accept="video/*"
                                    hidden
                                    onChange={(e) => handleVideo(mod.id, lec, e.target.files?.[0])}
                                  />

                                  <button
                                    onClick={() => resourceInputs.current[lec.id]?.click()}
                                    className="inline-flex items-center gap-1 font-semibold text-primary-accent hover:underline"
                                  >
                                    <Icon name="attach_file" className="text-sm" /> Attach resource
                                  </button>
                                  <input
                                    ref={(el) => (resourceInputs.current[lec.id] = el)}
                                    type="file"
                                    accept=".pdf,.ipynb,.zip,.doc,.docx,.ppt,.pptx"
                                    hidden
                                    onChange={(e) => handleResource(mod.id, lec, e.target.files?.[0])}
                                  />

                                  {lec.videoUrl && (
                                    <span className="inline-flex items-center gap-1 text-secondary">
                                      <Icon name="check_circle" className="text-sm" /> Video ready
                                    </span>
                                  )}
                                  {lec.resources?.length > 0 && (
                                    <span className="text-muted">{lec.resources.length} resource(s)</span>
                                  )}
                                </div>

                                {upload?.lectureId === lec.id && (
                                  <div className="mt-2 rounded-lg bg-surface-container p-3">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="truncate font-medium">
                                        {upload.name} · {formatBytes(upload.size)}
                                      </span>
                                      <span className="font-semibold text-primary-accent">{upload.percent}%</span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-card">
                                      <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${upload.percent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {(mod.lectures || []).length === 0 && (
                              <p className="text-xs text-muted">No lectures in this module yet.</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {(selected.modules || []).length === 0 && (
                        <p className="rounded-2xl border border-dashed border-line-strong bg-card p-6 text-center text-sm text-muted">
                          Add a module to begin building your curriculum.
                        </p>
                      )}
                    </div>
                  )}

                  {tab === 'details' && (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Title</span>
                          <input
                            defaultValue={selected.title}
                            onBlur={(e) => saveCourseField('title', e.target.value)}
                            className={inputCls}
                          />
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Course code</span>
                          <input
                            defaultValue={selected.code}
                            onBlur={(e) => saveCourseField('code', e.target.value)}
                            className={inputCls}
                          />
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Discipline</span>
                          <select
                            defaultValue={selected.discipline}
                            onChange={(e) => saveCourseField('discipline', e.target.value)}
                            className={inputCls}
                          >
                            {DISCIPLINES.map((d) => (
                              <option key={d}>{d}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Level</span>
                          <select
                            defaultValue={selected.level}
                            onChange={(e) => saveCourseField('level', e.target.value)}
                            className={inputCls}
                          >
                            {LEVELS.map((l) => (
                              <option key={l}>{l}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Price (₹)</span>
                          <input
                            type="number"
                            defaultValue={selected.price}
                            onBlur={(e) => saveCourseField('price', Number(e.target.value))}
                            className={inputCls}
                          />
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Original price (₹)</span>
                          <input
                            type="number"
                            defaultValue={selected.originalPrice}
                            onBlur={(e) => saveCourseField('originalPrice', Number(e.target.value))}
                            className={inputCls}
                          />
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Duration (hours)</span>
                          <input
                            type="number"
                            defaultValue={selected.durationHours}
                            onBlur={(e) => saveCourseField('durationHours', Number(e.target.value))}
                            className={inputCls}
                          />
                        </label>
                        <label className="text-sm">
                          <span className="mb-1 block font-semibold">Level badge</span>
                          <input
                            defaultValue={selected.levelBadge}
                            onBlur={(e) => saveCourseField('levelBadge', e.target.value)}
                            className={inputCls}
                          />
                        </label>
                      </div>

                      <label className="block text-sm">
                        <span className="mb-1 block font-semibold">Description</span>
                        <textarea
                          rows={4}
                          defaultValue={selected.description}
                          onBlur={(e) => saveCourseField('description', e.target.value)}
                          className={`${inputCls} resize-none`}
                        />
                      </label>

                      <div className="flex items-center gap-4">
                        {selected.thumbnail && (
                          <img src={selected.thumbnail} alt="" className="h-20 w-32 rounded-xl object-cover" />
                        )}
                        <div>
                          <button
                            onClick={() => thumbInput.current?.click()}
                            className="inline-flex items-center gap-2 rounded-xl bg-surface-container px-4 py-2 text-sm font-semibold text-primary-accent"
                          >
                            <Icon name="image" className="text-base" /> Upload thumbnail
                          </button>
                          <input
                            ref={thumbInput}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleThumbnail(e.target.files?.[0])}
                          />
                          {thumbUpload !== null && (
                            <div className="mt-2 w-40">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                                <div className="h-full bg-primary" style={{ width: `${thumbUpload}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'profile' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {photoURL ? (
                          <img src={photoURL} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                        ) : (
                          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-fixed">
                            <Icon name="person" className="text-3xl text-primary-accent" />
                          </span>
                        )}
                        <div>
                          <button
                            onClick={() => avatarInput.current?.click()}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                          >
                            <Icon name="photo_camera" className="text-base" /> Upload profile photo
                          </button>
                          <input
                            ref={avatarInput}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleAvatar(e.target.files?.[0])}
                          />
                          <p className="mt-2 text-xs text-muted">
                            JPG or PNG. Shown across the catalog.
                          </p>
                          {avatarUpload !== null && (
                            <div className="mt-2 w-48">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                                <div className="h-full bg-primary" style={{ width: `${avatarUpload}%` }} />
                              </div>
                              <p className="mt-1 text-xs text-primary-accent">{avatarUpload}%</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          {
                            label: 'Display name',
                            value: profile?.displayName || displayName,
                            save: saveDisplayName,
                          },
                          {
                            label: 'Affiliation',
                            value: instructor?.affiliation,
                            save: (v) => saveInstructorField('affiliation', v),
                          },
                          {
                            label: 'Qualification',
                            value: instructor?.phd,
                            save: (v) => saveInstructorField('phd', v),
                          },
                          {
                            label: 'Role / title',
                            value: instructor?.role,
                            save: (v) => saveInstructorField('role', v),
                          },
                        ].map((f) => (
                          <label key={f.label} className="text-sm">
                            <span className="mb-1 block font-semibold">{f.label}</span>
                            <input
                              key={f.value || ''}
                              defaultValue={f.value || ''}
                              onBlur={(e) => f.save(e.target.value)}
                              className={inputCls}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-line bg-card p-5">
                <h3 className="font-display font-bold">Publishing readiness</h3>
                {selected ? (
                  <>
                    <ul className="mt-3 space-y-2 text-sm">
                      {[
                        { label: 'Title & description', done: !!(selected.title && selected.description) },
                        { label: 'Pricing set', done: (selected.price || 0) > 0 },
                        { label: 'Thumbnail', done: !!selected.thumbnail },
                        {
                          label: 'At least one lecture',
                          done: (selected.modules || []).some((m) => (m.lectures || []).length > 0),
                        },
                        {
                          label: 'A lecture has video',
                          done: (selected.modules || []).some((m) =>
                            (m.lectures || []).some((l) => l.videoUrl)
                          ),
                        },
                      ].map((c) => (
                        <li key={c.label} className="flex items-center gap-2">
                          <Icon
                            name={c.done ? 'check_circle' : 'radio_button_unchecked'}
                            className={c.done ? 'text-secondary' : 'text-faint'}
                          />
                          <span className={c.done ? 'text-on-surface' : 'text-muted'}>{c.label}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={publish}
                      disabled={busy === 'publish'}
                      className="mt-4 w-full rounded-xl bg-secondary-fill px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary-fill-hover disabled:opacity-60"
                    >
                      {busy === 'publish' ? 'Publishing…' : 'Publish to catalog'}
                    </button>
                    {selected.status === 'published' && (
                      <p className="mt-2 text-center text-xs text-secondary">
                        Live — visible to all students.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">Select a course.</p>
                )}
              </div>

              {selected && (
                <div className="rounded-2xl border border-line bg-card p-5 text-sm">
                  <h3 className="font-display font-bold">Course snapshot</h3>
                  <dl className="mt-3 space-y-1.5">
                    <div className="flex justify-between">
                      <dt className="text-muted">Status</dt>
                      <dd className="font-semibold capitalize">{selected.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Modules</dt>
                      <dd className="font-semibold">{(selected.modules || []).length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Price</dt>
                      <dd className="font-semibold">{formatINR(selected.price)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Enrolled</dt>
                      <dd className="font-semibold">{selected.enrolledCount || 0}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
