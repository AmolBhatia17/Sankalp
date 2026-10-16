import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import {
  ArrowLeft,
  Folder,
  FileText,
  Video,
  ChevronDown,
  ChevronRight,
  Lock,
  Presentation,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Play,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';
import LectureModal from '../components/LectureModal';

export default function CourseDetail() {
  const { id } = useParams();
  const { courses, loading } = useCourses();
  const course = useMemo(() => courses.find((c) => c.id === id) || courses[0] || {}, [courses, id]);
  const [activeTab, setActiveTab] = useState('course-material');
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const expandedModule = selectedModuleId ?? course.modules?.[0]?.id ?? null;

  // Modals & Pending Actions
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [activeLectureItem, setActiveLectureItem] = useState(null);
  const [pendingPart, setPendingPart] = useState(null);
  const [targetPaymentItem, setTargetPaymentItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const { user } = useAuth();
  const { isCourseSubscribed, subscribeCourse } = useSubscription();
  const isSubscribed = isCourseSubscribed(course.id);

  const selectedSection = course.sections?.find((s) => s.id === activeTab) || course.sections?.[0];

  const toggleModule = (moduleId) => {
    setSelectedModuleId((prev) => ((prev ?? course.modules?.[0]?.id) === moduleId ? null : moduleId));
  };

  /**
   * Triple-Gate Security Handler:
   * 1. Unauthenticated -> Prompt Login first
   * 2. Authenticated, Unsubscribed -> Prompt Payment/Subscription
   * 3. Authenticated & Subscribed -> Unlock Document / Video / PDF
   */
  const handlePartClick = (part) => {
    // Case 1: User is not authenticated -> Ask to log in first
    if (!user) {
      setPendingPart(part);
      setAuthOpen(true);
      return;
    }

    // Case 2: User is authenticated but NOT subscribed -> Prompt Payment / Subscription
    if (!isSubscribed) {
      setTargetPaymentItem(part);
      setPaymentOpen(true);
      return;
    }

    // Case 3: User is authenticated and subscribed -> Launch EdTech Lecture/Notes Player Modal!
    setActiveLectureItem(part);
    setLectureModalOpen(true);
  };

  // Called when user finishes authentication (Sign In or Sign Up)
  const handleAuthSuccess = () => {
    if (isSubscribed) {
      if (pendingPart) {
        setActiveLectureItem(pendingPart);
        setLectureModalOpen(true);
      }
      setPendingPart(null);
    } else {
      // User is now logged in! Automatically transition to Step 2: Payment prompt
      setTargetPaymentItem(pendingPart);
      setPendingPart(null);
      setPaymentOpen(true);
    }
  };

  // Called when Razorpay payment succeeds
  const handlePaymentSuccess = (paymentData) => {
    subscribeCourse(course.id, paymentData);
    setToastMessage(`🎉 Payment Verified! Full course access is unlocked for ${user?.email}.`);
    setTimeout(() => setToastMessage(null), 5000);

    // If user clicked a specific lecture/doc before paying, launch it
    if (targetPaymentItem) {
      setActiveLectureItem(targetPaymentItem);
      setLectureModalOpen(true);
    }
    setTargetPaymentItem(null);
  };

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="detail-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <p style={{ color: '#94a3b8' }}>Loading course curriculum from database...</p>
        </div>
      </div>
    );
  }

  if (!course || !course.id) {
    return (
      <div className="course-detail-page">
        <div className="detail-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Course Not Found</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>The requested course could not be located in the catalog.</p>
          <Link to="/" className="btn-back" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  // Helper to check if current tab has module data
  const hasModuleDataForTab =
    course.modules &&
    ((activeTab === 'course-material' && course.modules.some((m) => m.parts?.length > 0)) ||
      (activeTab === 'video-lectures' && course.modules.some((m) => m.videos?.length > 0)));

  return (
    <div className="course-detail-page">

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="course-floating-toast">
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="detail-container">
        {/* Back Button */}
        <Link to="/" className="btn-back">
          <ArrowLeft size={16} />
          <span>Back to Courses</span>
        </Link>

        {/* Subject Header */}
        <div className="detail-header">
          <div className="detail-header-badges">
            <span className="course-badge">{course.badge}</span>
            {isSubscribed ? (
              <span className="course-badge subscribed-badge">
                <ShieldCheck size={14} />
                <span>Subscribed • Full Access</span>
              </span>
            ) : (
              <span className="course-badge price-tag-badge">₹{course.price || 499}</span>
            )}
          </div>

          <h1 className="detail-title">{course.title}</h1>
          <p className="detail-description">{course.description}</p>
        </div>

        {/* 2 Main Sections Toggle (Course Material / Video Lectures) */}
        <div className="section-tabs">
          {course.sections?.map((sec) => (
            <button
              key={sec.id}
              className={`section-tab-btn ${activeTab === sec.id ? 'active' : ''}`}
              onClick={() => setActiveTab(sec.id)}
            >
              {sec.id === 'video-lectures' ? <Video size={18} /> : <Folder size={18} />}
              <span>{sec.title}</span>
            </button>
          ))}
        </div>

        {/* Module-Wise Accordion View (Supports BOTH Course Material & Video Lectures) */}
        {hasModuleDataForTab ? (
          <div className="modules-accordion-wrapper">
            <div className="modules-header">
              <div>
                <h2 className="modules-title">
                  {activeTab === 'video-lectures'
                    ? 'Module-Wise Video Lectures'
                    : 'Module-Wise Course Curriculum'}
                </h2>
                <p className="modules-subtitle">
                  {activeTab === 'video-lectures'
                    ? 'Watch comprehensive instructor video sessions categorized module by module.'
                    : 'Click on each module to view detailed concept presentations, spec sheets & topics.'}
                </p>
              </div>
              {isSubscribed && (
                <div className="access-status-indicator unlocked">
                  <CheckCircle2 size={16} />
                  <span>All Modules Unlocked</span>
                </div>
              )}
            </div>

            <div className="modules-list">
              {course.modules.map((mod) => {
                const isExpanded = expandedModule === mod.id;
                const itemsCount =
                  activeTab === 'video-lectures'
                    ? mod.videos?.length || 0
                    : mod.parts?.length || 0;

                return (
                  <div key={mod.id} className={`module-accordion-card ${isExpanded ? 'open' : ''}`}>
                    <button
                      className="module-accordion-header"
                      onClick={() => toggleModule(mod.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="module-header-left">
                        <span className="module-badge">M{mod.number}</span>
                        <span className="module-title-text">{mod.title || `Module ${mod.number}`}</span>
                      </div>
                      <div className="module-header-right">
                        <span className="module-parts-count">
                          {itemsCount} {activeTab === 'video-lectures' ? 'Videos' : 'Topics'}
                        </span>
                        {isExpanded ? (
                          <ChevronDown size={20} className="accordion-icon" />
                        ) : (
                          <ChevronRight size={20} className="accordion-icon" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="module-accordion-body">
                        {activeTab === 'video-lectures' ? (
                          /* Video Lectures Grid for this Module */
                          <div className="module-videos-grid">
                            {mod.videos && mod.videos.length > 0 ? (
                              mod.videos.map((vid) => (
                                <div
                                  key={vid.id}
                                  className={`module-video-card ${
                                    isSubscribed ? 'unlocked-card' : 'locked-card'
                                  }`}
                                  onClick={() => handlePartClick(vid)}
                                  title={
                                    !user
                                      ? 'Sign in to access'
                                      : !isSubscribed
                                      ? 'Click to subscribe and unlock video'
                                      : 'Click to play video lecture'
                                  }
                                >
                                  <div className="video-thumbnail-box">
                                    <div className="video-thumb-gradient" />
                                    <div className="video-play-badge">
                                      <Play size={18} fill="#ffffff" color="#ffffff" />
                                    </div>
                                    <span className="video-duration-pill">
                                      <Clock size={12} />
                                      {vid.duration}
                                    </span>
                                  </div>

                                  <div className="video-card-content">
                                    <div className="video-card-top-row">
                                      <span className="video-filename-tag">{vid.file}</span>
                                      {isSubscribed ? (
                                        <Unlock size={15} color="#34d399" />
                                      ) : (
                                        <Lock size={15} color="#f59e0b" />
                                      )}
                                    </div>

                                    <h4 className="video-card-title">{vid.title}</h4>

                                    <div className="video-card-footer">
                                      <span className="part-badge">Module {mod.number}</span>
                                      <span className="doc-format-badge video-badge">
                                        {isSubscribed ? 'UNLOCKED' : 'MP4 VIDEO'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="no-items-hint">No video lectures currently uploaded for this module.</p>
                            )}
                          </div>
                        ) : (
                          /* Course Material (PPTX, PDFs, Spec Sheets) */
                          <div className="module-parts-grid">
                            {mod.parts?.map((part) => (
                              <div
                                key={part.id}
                                className={`module-part-card ${
                                  part.type === 'pdf'
                                    ? 'pdf-type'
                                    : part.type === 'pcb'
                                    ? 'pcb-type'
                                    : 'pptx-type'
                                } ${isSubscribed ? 'unlocked-card' : 'locked-card'}`}
                                onClick={() => handlePartClick(part)}
                                title={
                                  !user
                                    ? 'Sign in to access'
                                    : !isSubscribed
                                    ? 'Click to subscribe and unlock'
                                    : 'Click to open document'
                                }
                              >
                                <div className="part-card-top">
                                  <div className="ppt-indicator">
                                    {part.type === 'pdf' ? (
                                      <FileText size={15} color="#ef4444" />
                                    ) : (
                                      <Presentation size={15} color="#f97316" />
                                    )}
                                    <span className="ppt-filename">{part.file}</span>
                                  </div>
                                  {isSubscribed ? (
                                    <Unlock size={15} color="#34d399" />
                                  ) : (
                                    <Lock size={15} color="#f59e0b" />
                                  )}
                                </div>

                                {/* Blueprint/Drawing Preview Thumbnail for CAD PDFs */}
                                {part.type === 'pdf' && (
                                  <div className="blueprint-preview-box">
                                    <div className="blueprint-tech-lines">
                                      <div className="blueprint-crosshair"></div>
                                      <span className="blueprint-label">TECHNICAL DRAWING / SPEC SHEET</span>
                                    </div>
                                  </div>
                                )}

                                {/* PCB Circuit Preview for Differential Routing */}
                                {part.type === 'pcb' && (
                                  <div className="pcb-preview-box">
                                    <div className="pcb-board">
                                      <div className="pcb-trace trace-1"></div>
                                      <div className="pcb-trace trace-2"></div>
                                      <div className="pcb-pads">
                                        <span className="pcb-pad"></span>
                                        <span className="pcb-pad"></span>
                                      </div>
                                      <div className="pcb-labels">
                                        <span>GND</span>
                                        <span>3.3V</span>
                                        <span>TX</span>
                                        <span>RX</span>
                                      </div>
                                      <span className="pcb-tag">DIFFERENTIAL PAIR PS1</span>
                                    </div>
                                  </div>
                                )}

                                <h4 className="part-card-title">{part.title}</h4>
                                <div className="part-card-footer">
                                  <span className="part-badge">
                                    Module {mod.number} • {part.id}
                                  </span>
                                  <span className="doc-format-badge">
                                    {isSubscribed ? 'UNLOCKED' : part.type ? part.type.toUpperCase() : 'PPTX'}
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

            {/* Enrollment Banner at Bottom */}
            {isSubscribed ? (
              <div className="enroll-banner subscribed-banner">
                <div className="enrolled-text">
                  <ShieldCheck size={24} color="#34d399" />
                  <div>
                    <h4>You are Enrolled in {course.title}</h4>
                    <p>Lifetime access verified for {user?.email}. All 12 video lectures and presentation decks are unlocked.</p>
                  </div>
                </div>
                <div className="enrolled-badge-pill">
                  <Sparkles size={16} />
                  <span>Active Student Access</span>
                </div>
              </div>
            ) : (
              <div className="enroll-banner">
                <p>
                  Enroll in <strong>{course.title}</strong> to unlock all 12 video lectures, full presentation slide decks (.pptx), and CAD drawings.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => handlePartClick({ file: 'Full Syllabus Deck' })}
                >
                  <Lock size={16} />
                  <span>Buy Course for ₹{course.price || 499}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Fallback view for courses with simple item lists */
          <div className="section-content-card">
            <h3 className="section-card-title">
              {activeTab === 'course-material' ? (
                <FileText size={20} color="#34d399" />
              ) : (
                <Video size={20} color="#34d399" />
              )}
              <span>{selectedSection?.title} List</span>
            </h3>

            <div className="item-list">
              {selectedSection?.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="content-item"
                  onClick={() => handlePartClick(item)}
                  style={{ cursor: 'pointer' }}
                  title={
                    !user
                      ? 'Sign in to access'
                      : !isSubscribed
                      ? 'Click to subscribe and unlock'
                      : 'Click to open'
                  }
                >
                  <div className="item-left">
                    {activeTab === 'course-material' ? (
                      <FileText size={18} color="#94a3b8" />
                    ) : (
                      <Video size={18} color="#94a3b8" />
                    )}
                    <div className="item-info">
                      <span className="item-name">{item.name || item.title}</span>
                      {item.duration && <span className="item-duration">{item.duration}</span>}
                    </div>
                  </div>
                  <div className="item-right">
                    {isSubscribed ? (
                      <Unlock size={16} color="#34d399" />
                    ) : (
                      <Lock size={16} color="#f59e0b" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isSubscribed ? (
              <div className="enroll-banner subscribed-banner">
                <div className="enrolled-text">
                  <ShieldCheck size={24} color="#34d399" />
                  <div>
                    <h4>You are Enrolled in {course.title}</h4>
                    <p>All video lectures and curriculum items are active.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="enroll-banner">
                <p>
                  Enroll in <strong>{course.title}</strong> to instantly unlock all course materials and video lectures.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => handlePartClick({ file: 'Full Course Access' })}
                >
                  <Lock size={16} />
                  <span>Buy Course for ₹{course.price || 499}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal (Gate 1: Login required) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingPart(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Payment Modal (Gate 2: Payment/Subscription required) */}
      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          setTargetPaymentItem(null);
        }}
        course={course}
        targetItem={targetPaymentItem}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* EdTech Lecture Player / Notes Viewer Modal */}
      <LectureModal
        isOpen={lectureModalOpen}
        onClose={() => {
          setLectureModalOpen(false);
          setActiveLectureItem(null);
        }}
        item={activeLectureItem}
        courseTitle={course?.title || 'Course'}
        moduleTitle={
          course?.modules?.find((m) =>
            m.parts?.some((p) => p.id === activeLectureItem?.id) ||
            m.videos?.some((v) => v.id === activeLectureItem?.id)
          )?.title || 'Course Module'
        }
      />
    </div>
  );
}