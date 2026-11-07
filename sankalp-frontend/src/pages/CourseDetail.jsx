import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useCourses } from '../hooks/useCourses';
import {
  ArrowLeft, Folder, FileText, Video, ChevronDown, ChevronRight,
  Lock, Presentation, Unlock, ShieldCheck, CheckCircle2,
  Sparkles, Play, Clock, Loader2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useSubscription } from '../context/useSubscription';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';
import LectureModal from '../components/LectureModal';

export default function CourseDetail() {
  const { id } = useParams();
  const { courses, loading } = useCourses();

  const course = useMemo(
    () => courses.find((item) => item.id === id) || null,
    [courses, id]
  );

  const { user } = useAuth();
  const { isCourseSubscribed, loadingSubscriptions } = useSubscription();
  const isSubscribed = Boolean(user && course?.id && isCourseSubscribed(course.id));

  const [resourceState, setResourceState] = useState({
    courseId: null,
    data: null,
    error: '',
    loading: false,
  });

  const currentResourceState =
    isSubscribed && resourceState.courseId === course?.id
      ? resourceState
      : null;

  const resourceData = currentResourceState?.data ?? null;
  const resourceError = currentResourceState?.error ?? '';
  const resourcesLoading = Boolean(
    isSubscribed && db && course?.id &&
    (!currentResourceState || currentResourceState.loading)
  );

  const [activeTab, setActiveTab] = useState('course-material');
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [activeLectureItem, setActiveLectureItem] = useState(null);
  const [pendingPart, setPendingPart] = useState(null);
  const [targetPaymentItem, setTargetPaymentItem] = useState(null);

  // Protected resources are fetched only after enrollment is confirmed.
  useEffect(() => {
    let cancelled = false;

    if (!isSubscribed || !db || !course?.id) {
      return () => {
        cancelled = true;
      };
    }

    const courseId = course.id;

    async function loadProtectedResources() {
      try {
        const resourceRef = doc(db, 'courseResources', courseId);
        const snapshot = await getDoc(resourceRef);

        if (!snapshot.exists()) {
          throw new Error('Course resources are not available yet.');
        }

        if (!cancelled) {
          setResourceState({
            courseId,
            data: snapshot.data(),
            error: '',
            loading: false,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setResourceState({
            courseId,
            data: null,
            error: 'Unable to load course resources. Please try again.',
            loading: false,
          });
          console.error('Protected resource loading failed:', error);
        }
      }
    }

    loadProtectedResources();

    return () => {
      cancelled = true;
    };
  }, [isSubscribed, course?.id]);

  const modules = isSubscribed ? resourceData?.modules || [] : [];
  const sections = course?.sections || [
    { id: 'course-material', title: 'Course Material' },
    { id: 'video-lectures', title: 'Video Lectures' },
  ];

  const selectedSection =
    sections.find((section) => section.id === activeTab) || sections[0];

  const expandedModule =
    selectedModuleId ?? modules[0]?.id ?? null;

  const [toastMessage] = useState(null);

  const toggleModule = (moduleId) => {
    setSelectedModuleId((previous) =>
      (previous ?? modules[0]?.id) === moduleId ? null : moduleId
    );
  };

  const handlePartClick = (part) => {
    if (!user) {
      setPendingPart(part);
      setAuthOpen(true);
      return;
    }

    if (!isSubscribed) {
      setTargetPaymentItem(part);
      setPaymentOpen(true);
      return;
    }

    // Never open a resource unless it came from the protected Firestore read.
    const protectedItem = [...modules].some((module) =>
      [...(module.parts || []), ...(module.videos || [])].some(
        (item) => item.id === part.id && item.url === part.url
      )
    );

    if (!protectedItem) {
      setResourceState((previous) => ({
        ...previous,
        courseId: course.id,
        data: resourceData,
        error: 'This resource is not available in the protected course catalogue.',
        loading: false,
      }));
      return;
    }

    setActiveLectureItem(part);
    setLectureModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    setTargetPaymentItem(pendingPart);
    setPendingPart(null);
    setPaymentOpen(true);
  };

  if (loading || loadingSubscriptions) {
    return (
      <div className="course-detail-page">
        <div className="detail-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <Loader2 className="spin" size={24} />
          <p style={{ color: '#94a3b8' }}>Loading course information...</p>
        </div>
      </div>
    );
  }

  if (!course?.id) {
    return (
      <div className="course-detail-page">
        <div className="detail-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <h2>Course Not Found</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            The requested course could not be located in the catalogue.
          </p>
          <Link to="/" className="btn-back" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasModuleDataForTab = modules.some((module) =>
    activeTab === 'video-lectures'
      ? module.videos?.length > 0
      : module.parts?.length > 0
  );

  const hasProtectedSectionItems =
    isSubscribed && resourceData?.sections?.some(
      (section) => section.id === activeTab && section.items?.length > 0
    );

  const moduleTitle =
    modules.find((module) =>
      [...(module.parts || []), ...(module.videos || [])].some(
        (item) => item.id === activeLectureItem?.id
      )
    )?.title || 'Course Module';

  return (
    <div className="course-detail-page">
      {toastMessage && (
        <div className="course-floating-toast">
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="detail-container">
        <Link to="/" className="btn-back">
          <ArrowLeft size={16} />
          <span>Back to Courses</span>
        </Link>

        <div className="detail-header">
          <div className="detail-header-badges">
            {course.badge && <span className="course-badge">{course.badge}</span>}
            {isSubscribed ? (
              <span className="course-badge subscribed-badge">
                <ShieldCheck size={14} />
                <span>Enrolled • Full Access</span>
              </span>
            ) : (
              <span className="course-badge price-tag-badge">
                ₹{course.price || 499}
              </span>
            )}
          </div>

          <h1 className="detail-title">{course.title}</h1>
          <p className="detail-description">{course.description}</p>
        </div>

        <div className="section-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`section-tab-btn ${activeTab === section.id ? 'active' : ''}`}
              onClick={() => setActiveTab(section.id)}
            >
              {section.id === 'video-lectures'
                ? <Video size={18} />
                : <Folder size={18} />}
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {!isSubscribed ? (
          <div className="section-content-card">
            <h3 className="section-card-title">
              <Lock size={20} />
              <span>Protected Course Content</span>
            </h3>
            <p>
              Course materials and video lectures are available to enrolled
              students. Sign in and complete enrollment to access them.
            </p>
            <div className="enroll-banner">
              <p>
                Enroll in <strong>{course.title}</strong> to unlock the
                protected course materials and video lectures.
              </p>
              <button
                className="btn-primary"
                onClick={() => handlePartClick({ file: 'Full Course Access' })}
              >
                <Lock size={16} />
                <span>Buy Course for ₹{course.price || 499}</span>
              </button>
            </div>
          </div>
        ) : resourcesLoading ? (
          <div className="section-content-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 className="spin" size={24} />
            <p>Loading your protected course resources...</p>
          </div>
        ) : resourceError ? (
          <div className="section-content-card" role="alert">
            <AlertCircle size={20} color="#dc2626" />
            <p>{resourceError}</p>
          </div>
        ) : hasModuleDataForTab ? (
          <div className="modules-accordion-wrapper">
            <div className="modules-header">
              <div>
                <h2 className="modules-title">
                  {activeTab === 'video-lectures'
                    ? 'Module-Wise Video Lectures'
                    : 'Module-Wise Course Curriculum'}
                </h2>
                <p className="modules-subtitle">
                  Access your enrolled course materials and lectures.
                </p>
              </div>
              <div className="access-status-indicator unlocked">
                <CheckCircle2 size={16} />
                <span>All Modules Unlocked</span>
              </div>
            </div>

            <div className="modules-list">
              {modules.map((module) => {
                const isExpanded = expandedModule === module.id;
                const items = activeTab === 'video-lectures'
                  ? module.videos || []
                  : module.parts || [];

                return (
                  <div
                    key={module.id}
                    className={`module-accordion-card ${isExpanded ? 'open' : ''}`}
                  >
                    <button
                      className="module-accordion-header"
                      onClick={() => toggleModule(module.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="module-header-left">
                        <span className="module-badge">M{module.number}</span>
                        <span className="module-title-text">
                          {module.title || `Module ${module.number}`}
                        </span>
                      </div>
                      <div className="module-header-right">
                        <span className="module-parts-count">
                          {items.length} {activeTab === 'video-lectures' ? 'Videos' : 'Topics'}
                        </span>
                        {isExpanded
                          ? <ChevronDown size={20} className="accordion-icon" />
                          : <ChevronRight size={20} className="accordion-icon" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="module-accordion-body">
                        {activeTab === 'video-lectures' ? (
                          <div className="module-videos-grid">
                            {items.length ? items.map((video) => (
                              <div
                                key={video.id}
                                className="module-video-card unlocked-card"
                                onClick={() => handlePartClick(video)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') handlePartClick(video);
                                }}
                              >
                                <div className="video-thumbnail-box">
                                  <div className="video-thumb-gradient" />
                                  <div className="video-play-badge">
                                    <Play size={18} fill="#ffffff" color="#ffffff" />
                                  </div>
                                  <span className="video-duration-pill">
                                    <Clock size={12} />
                                    {video.duration}
                                  </span>
                                </div>
                                <div className="video-card-content">
                                  <div className="video-card-top-row">
                                    <span className="video-filename-tag">{video.file}</span>
                                    <Unlock size={15} color="#34d399" />
                                  </div>
                                  <h4 className="video-card-title">{video.title}</h4>
                                  <div className="video-card-footer">
                                    <span className="part-badge">Module {module.number}</span>
                                    <span className="doc-format-badge video-badge">UNLOCKED</span>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <p className="no-items-hint">No video lectures uploaded for this module.</p>
                            )}
                          </div>
                        ) : (
                          <div className="module-parts-grid">
                            {items.map((part) => (
                              <div
                                key={part.id}
                                className={`module-part-card ${
                                  part.type === 'pdf' ? 'pdf-type' :
                                  part.type === 'pcb' ? 'pcb-type' : 'pptx-type'
                                } unlocked-card`}
                                onClick={() => handlePartClick(part)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') handlePartClick(part);
                                }}
                              >
                                <div className="part-card-top">
                                  <div className="ppt-indicator">
                                    {part.type === 'pdf'
                                      ? <FileText size={15} color="#ef4444" />
                                      : <Presentation size={15} color="#f97316" />}
                                    <span className="ppt-filename">{part.file}</span>
                                  </div>
                                  <Unlock size={15} color="#34d399" />
                                </div>

                                {part.type === 'pdf' && (
                                  <div className="blueprint-preview-box">
                                    <div className="blueprint-tech-lines">
                                      <div className="blueprint-crosshair" />
                                      <span className="blueprint-label">
                                        TECHNICAL DRAWING / SPEC SHEET
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {part.type === 'pcb' && (
                                  <div className="pcb-preview-box">
                                    <div className="pcb-board">
                                      <div className="pcb-trace trace-1" />
                                      <div className="pcb-trace trace-2" />
                                      <div className="pcb-pads">
                                        <span className="pcb-pad" />
                                        <span className="pcb-pad" />
                                      </div>
                                      <div className="pcb-labels">
                                        <span>GND</span><span>3.3V</span>
                                        <span>TX</span><span>RX</span>
                                      </div>
                                      <span className="pcb-tag">DIFFERENTIAL PAIR PS1</span>
                                    </div>
                                  </div>
                                )}

                                <h4 className="part-card-title">{part.title}</h4>
                                <div className="part-card-footer">
                                  <span className="part-badge">
                                    Module {module.number} • {part.id}
                                  </span>
                                  <span className="doc-format-badge">
                                    UNLOCKED
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="enroll-banner subscribed-banner">
              <div className="enrolled-text">
                <ShieldCheck size={24} color="#34d399" />
                <div>
                  <h4>You are Enrolled in {course.title}</h4>
                  <p>Protected resource access verified for {user?.email}.</p>
                </div>
              </div>
              <div className="enrolled-badge-pill">
                <Sparkles size={16} />
                <span>Active Student Access</span>
              </div>
            </div>
          </div>
        ) : hasProtectedSectionItems ? (
          <div className="section-content-card">
            <h3 className="section-card-title">
              {activeTab === 'course-material'
                ? <FileText size={20} color="#34d399" />
                : <Video size={20} color="#34d399" />}
              <span>{selectedSection?.title} List</span>
            </h3>
            <div className="item-list">
              {resourceData.sections
                .find((section) => section.id === activeTab)
                ?.items?.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="content-item"
                    onClick={() => handlePartClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handlePartClick(item);
                    }}
                  >
                    <div className="item-left">
                      {activeTab === 'course-material'
                        ? <FileText size={18} color="#94a3b8" />
                        : <Video size={18} color="#94a3b8" />}
                      <div className="item-info">
                        <span className="item-name">{item.name || item.title}</span>
                        {item.duration && (
                          <span className="item-duration">{item.duration}</span>
                        )}
                      </div>
                    </div>
                    <div className="item-right">
                      <Unlock size={16} color="#34d399" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="section-content-card">
            <h3 className="section-card-title">
              <Folder size={20} />
              <span>{selectedSection?.title || 'Course Content'}</span>
            </h3>
            <p>No resources are currently available in this section.</p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingPart(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          setTargetPaymentItem(null);
        }}
        course={course}
        targetItem={targetPaymentItem}
      />

      <LectureModal
        isOpen={lectureModalOpen}
        onClose={() => {
          setLectureModalOpen(false);
          setActiveLectureItem(null);
        }}
        item={activeLectureItem}
        courseTitle={course.title || 'Course'}
        moduleTitle={moduleTitle}
      />
    </div>
  );
}
