import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FolderPlus,
  FileText,
  Video,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { saveCourse, slugify, seedInitialCourses } from '../lib/courses';
import { app, db } from '../firebase/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function AddCourseModal({ isOpen, onClose, onCourseAdded }) {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [migrationFile, setMigrationFile] = useState(null);
  const [seedStatus, setSeedStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Migrate private course resources from the selected JSON file
  const handleSyncAllExistingSubjects = async () => {
    if (!db || !app) {
      setError('Firebase is not configured.');
      return;
    }

    if (!migrationFile) {
      setError('Please select courseResources.migration.json first.');
      return;
    }

    setSeeding(true);
    setError('');
    setSeedStatus('Reading migration file...');

    try {
      const courses = JSON.parse(await migrationFile.text());

      if (!Array.isArray(courses) || courses.length !== 3) {
        throw new Error('The migration file must contain exactly three courses.');
      }

      const totalModules = courses.reduce(
        (sum, course) => sum + (Array.isArray(course.modules) ? course.modules.length : 0),
        0
      );

      if (totalModules !== 22) {
        throw new Error(`Expected 22 modules, found ${totalModules}.`);
      }

      setSeedStatus('Seeding public course metadata...');
      await seedInitialCourses();

      setSeedStatus('Uploading protected course resources...');
      const functions = getFunctions(app, 'asia-south1');
      const migrate = httpsCallable(functions, 'migrateCourseResources');
      const result = await migrate({ courses });

      const data = result.data;
      setSeedStatus(
        `Migration complete: ${data.coursesMigrated} courses and ${data.modulesMigrated} modules uploaded.`
      );
    } catch (err) {
      console.error('Resource migration failed:', err);
      setError(err.message || 'Resource migration failed.');
    } finally {
      setSeeding(false);
    }
  };

  // Course Top-level metadata
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(1);
  const [price, setPrice] = useState(499);
  const [badge, setBadge] = useState('1st Year');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Modules array
  const [modules, setModules] = useState([
    {
      id: 'm1',
      number: 1,
      title: 'Module 1: Introduction',
      parts: [
        {
          id: 'p1',
          title: 'Course Presentation & Slides',
          file: 'Module1.pptx',
          type: 'pptx',
          url: '',
        },
      ],
      videos: [
        {
          id: 'v1',
          title: 'Lecture 1: Core Concepts & Overview',
          file: 'M1.mp4',
          duration: '30 mins',
          type: 'mp4',
          url: '',
        },
      ],
    },
  ]);

  if (!isOpen) return null;

  // Add a new module
  const handleAddModule = () => {
    const nextNumber = modules.length + 1;
    setModules([
      ...modules,
      {
        id: `m${nextNumber}`,
        number: nextNumber,
        title: `Module ${nextNumber}: New Module Title`,
        parts: [],
        videos: [],
      },
    ]);
  };

  // Remove a module
  const handleRemoveModule = (modIdx) => {
    setModules(modules.filter((_, idx) => idx !== modIdx));
  };

  // Update module title
  const handleModuleTitleChange = (modIdx, val) => {
    const updated = [...modules];
    updated[modIdx].title = val;
    setModules(updated);
  };

  // Add Part (PPT / PDF) to Module
  const handleAddPart = (modIdx) => {
    const updated = [...modules];
    const partNum = (updated[modIdx].parts?.length || 0) + 1;
    updated[modIdx].parts = [
      ...(updated[modIdx].parts || []),
      {
        id: `p${Date.now()}_${partNum}`,
        title: `Lecture Topic ${partNum}`,
        file: `Topic${partNum}.pptx`,
        type: 'pptx',
        url: '',
      },
    ];
    setModules(updated);
  };

  // Update Part field
  const handlePartFieldChange = (modIdx, partIdx, field, val) => {
    const updated = [...modules];
    updated[modIdx].parts[partIdx][field] = val;
    setModules(updated);
  };

  // Remove Part
  const handleRemovePart = (modIdx, partIdx) => {
    const updated = [...modules];
    updated[modIdx].parts = updated[modIdx].parts.filter((_, idx) => idx !== partIdx);
    setModules(updated);
  };

  // Add Video to Module
  const handleAddVideo = (modIdx) => {
    const updated = [...modules];
    const vidNum = (updated[modIdx].videos?.length || 0) + 1;
    updated[modIdx].videos = [
      ...(updated[modIdx].videos || []),
      {
        id: `v${Date.now()}_${vidNum}`,
        title: `Video Session ${vidNum}`,
        file: `Session${vidNum}.mp4`,
        duration: '30 mins',
        type: 'mp4',
        url: '',
      },
    ];
    setModules(updated);
  };

  // Update Video field
  const handleVideoFieldChange = (modIdx, vidIdx, field, val) => {
    const updated = [...modules];
    updated[modIdx].videos[vidIdx][field] = val;
    setModules(updated);
  };

  // Remove Video
  const handleRemoveVideo = (modIdx, vidIdx) => {
    const updated = [...modules];
    updated[modIdx].videos = updated[modIdx].videos.filter((_, idx) => idx !== vidIdx);
    setModules(updated);
  };

  // Submit and save course to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Course title is required.');
      return;
    }

    if (!db) {
      setError('Firebase Firestore is not initialized. Please ensure VITE_FIREBASE_API_KEY is configured in .env.');
      return;
    }

    setLoading(true);

    try {
      const courseId = slugify(title);
      const newCourse = {
        id: courseId,
        title: title.trim(),
        year: parseInt(year, 10),
        price: parseFloat(price) || 499,
        badge: badge || `${year}th Year`,
        rating: 5.0,
        modulesCount: modules.length,
        image:
          image.trim() ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
        description: description.trim() || `Comprehensive curriculum for ${title}.`,
        status: 'published',
        sections: [
          { id: 'course-material', title: 'Course Material' },
          { id: 'video-lectures', title: 'Video Lectures' },
        ],
        modules: modules.map((m, index) => ({
          ...m,
          number: index + 1,
        })),
      };

      await saveCourse(newCourse);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCourseAdded?.(newCourse);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving course to database:', err);
      setError(err.message || 'Failed to save course to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '2rem',
          color: '#f8fafc',
        }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderPlus size={24} color="#34d399" />
            Add New Course & Insert Drive Links
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Configure course modules, presentation slides (.pptx/.pdf) and video lecture drive links to publish directly to the database.
          </p>
        </div>

        {/* One-Click Sync Existing Site Subjects */}
        <div style={{ background: 'rgba(5, 150, 105, 0.12)', border: '1px solid #059669', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, color: '#34d399', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={16} />
            <span>Secure Course Resource Migration</span>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: '0.5rem 0' }}>
            Select the private migration JSON. Course metadata is seeded publicly; modules and resource links are uploaded separately to protected Firestore storage.
          </p>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => setMigrationFile(e.target.files?.[0] || null)}
            style={{ display: 'block', color: '#fff', margin: '0.75rem 0' }}
          />
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            {migrationFile ? migrationFile.name : 'No migration file selected'}
          </p>
          <button
            type="button"
            onClick={handleSyncAllExistingSubjects}
            disabled={seeding || !migrationFile}
            style={{
              background: '#059669',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: seeding || !migrationFile ? 'not-allowed' : 'pointer',
              opacity: seeding || !migrationFile ? 0.7 : 1,
            }}
          >
            {seeding ? 'Migrating...' : 'Migrate Protected Resources'}
          </button>
        </div>

        {seedStatus && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{seedStatus}</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CheckCircle2 size={54} color="#34d399" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Course Published to Database!</h3>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>The course and its module materials are now live on the platform.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step 1: Course Info */}
            <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: '#34d399' }}>
                1. Course Basic Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robot Vision"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      setBadge(`${e.target.value}${e.target.value === '1' ? 'st' : e.target.value === '2' ? 'nd' : e.target.value === '3' ? 'rd' : 'th'} Year`);
                    }}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Price (INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Badge Label</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. 3rd Year"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Thumbnail Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed course overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>

            {/* Step 2: Module-Wise Builder */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#34d399' }}>
                  2. Modules & Google Drive Resources
                </h3>
                <button
                  type="button"
                  onClick={handleAddModule}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#059669', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add Module
                </button>
              </div>

              {modules.map((mod, modIdx) => (
                <div
                  key={mod.id || modIdx}
                  style={{
                    background: '#131d33',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ background: '#059669', color: '#fff', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                      Module {modIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => handleModuleTitleChange(modIdx, e.target.value)}
                      placeholder={`Module ${modIdx + 1}: Title`}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                    />
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(modIdx)}
                        style={{ background: 'transparent', color: '#f87171', padding: '0.4rem' }}
                        title="Remove Module"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Module Slides / PPTs */}
                  <div style={{ marginBottom: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={15} color="#34d399" /> Presentation / Material Files (.pptx, .pdf)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddPart(modIdx)}
                        style={{ fontSize: '0.75rem', background: '#1e293b', color: '#34d399', border: '1px solid #334155', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                      >
                        + Add Document
                      </button>
                    </div>

                    {mod.parts?.map((part, pIdx) => (
                      <div key={part.id || pIdx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr 1.5fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Document Title"
                          value={part.title}
                          onChange={(e) => handlePartFieldChange(modIdx, pIdx, 'title', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Filename (e.g. M1.pptx)"
                          value={part.file}
                          onChange={(e) => handlePartFieldChange(modIdx, pIdx, 'file', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <select
                          value={part.type}
                          onChange={(e) => handlePartFieldChange(modIdx, pIdx, 'type', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        >
                          <option value="pptx">PPTX</option>
                          <option value="pdf">PDF</option>
                          <option value="pcb">PCB</option>
                        </select>
                        <input
                          type="url"
                          placeholder="Google Drive View Link (URL)"
                          value={part.url || ''}
                          onChange={(e) => handlePartFieldChange(modIdx, pIdx, 'url', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#34d399', fontSize: '0.8rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePart(modIdx, pIdx)}
                          style={{ background: 'transparent', color: '#f87171' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {(!mod.parts || mod.parts.length === 0) && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>No documents added for this module yet.</p>
                    )}
                  </div>

                  {/* Module Video Lectures */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Video size={15} color="#38bdf8" /> Video Lectures (.mp4 / Drive streaming)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddVideo(modIdx)}
                        style={{ fontSize: '0.75rem', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                      >
                        + Add Video
                      </button>
                    </div>

                    {mod.videos?.map((vid, vIdx) => (
                      <div key={vid.id || vIdx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr 1.5fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Lecture Title"
                          value={vid.title}
                          onChange={(e) => handleVideoFieldChange(modIdx, vIdx, 'title', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Filename (e.g. M1A.mp4)"
                          value={vid.file}
                          onChange={(e) => handleVideoFieldChange(modIdx, vIdx, 'file', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 35 mins)"
                          value={vid.duration}
                          onChange={(e) => handleVideoFieldChange(modIdx, vIdx, 'duration', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <input
                          type="url"
                          placeholder="Google Drive Video Preview/Stream URL"
                          value={vid.url || ''}
                          onChange={(e) => handleVideoFieldChange(modIdx, vIdx, 'url', e.target.value)}
                          style={{ padding: '0.4rem', background: '#0b1120', border: '1px solid #334155', borderRadius: '4px', color: '#38bdf8', fontSize: '0.8rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(modIdx, vIdx)}
                          style={{ background: 'transparent', color: '#f87171' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                    {(!mod.videos || mod.videos.length === 0) && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>No video lectures added for this module yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '0.6rem 1.2rem', background: '#1e293b', color: '#94a3b8', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: '#059669',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Save size={18} />
                <span>{loading ? 'Publishing to Database...' : 'Save Course to Database'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
