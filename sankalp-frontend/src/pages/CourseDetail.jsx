import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCourses } from '../data/mockCourses';
import { ArrowLeft, Folder, FileText, Video, ChevronDown, ChevronRight, Lock, Presentation } from 'lucide-react';

export default function CourseDetail() {
    const { id } = useParams();
    const course = mockCourses.find(c => c.id === id) || mockCourses[0];
    const [activeTab, setActiveTab] = useState('course-material');
    const [expandedModule, setExpandedModule] = useState(course.modules?.[0]?.id || 'm1');

    const selectedSection = course.sections?.find(s => s.id === activeTab) || course.sections?.[0];

    const toggleModule = (moduleId) => {
        setExpandedModule(prev => prev === moduleId ? null : moduleId);
    };

    return (
        <div className="course-detail-page">
            <div className="detail-container">

                {/* Back Button */}
                <Link to="/" className="btn-back">
                    <ArrowLeft size={16} />
                    <span>Back to Courses</span>
                </Link>

                {/* Subject Header */}
                <div className="detail-header">
                    <span className="course-badge">{course.badge}</span>
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
                            <Folder size={20} />
                            <span>{sec.title}</span>
                        </button>
                    ))}
                </div>

                {/* If Course has Module Accordions (e.g. Robot Vision) and Course Material is selected */}
                {course.modules && activeTab === 'course-material' ? (
                    <div className="modules-accordion-wrapper">
                        <div className="modules-header">
                            <h2 className="modules-title">Module-Wise Course Curriculum</h2>
                            <p className="modules-subtitle">Click on each module to view detailed concept presentations & topics.</p>
                        </div>

                        <div className="modules-list">
                            {course.modules.map((mod) => {
                                const isExpanded = expandedModule === mod.id;
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
                                                <span className="module-parts-count">{mod.parts?.length || 0} Topics</span>
                                                {isExpanded ? <ChevronDown size={20} className="accordion-icon" /> : <ChevronRight size={20} className="accordion-icon" />}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="module-accordion-body">
                                                <div className="module-parts-grid">
                                                    {mod.parts?.map((part) => (
                                                        <div key={part.id} className={`module-part-card ${part.type === 'pdf' ? 'pdf-type' : 'pptx-type'}`}>
                                                            <div className="part-card-top">
                                                                <div className="ppt-indicator">
                                                                    {part.type === 'pdf' ? (
                                                                        <FileText size={15} color="#ef4444" />
                                                                    ) : (
                                                                        <Presentation size={15} color="#f97316" />
                                                                    )}
                                                                    <span className="ppt-filename">{part.file}</span>
                                                                </div>
                                                                <Lock size={15} color="#64748b" />
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
                                                                <span className="part-badge">Module {mod.number} • {part.id}</span>
                                                                <span className="doc-format-badge">{part.type ? part.type.toUpperCase() : 'PPTX'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="enroll-banner">
                            <p>Enroll in <strong>{course.title}</strong> to unlock full presentation slide decks (.pptx) and recordings.</p>
                            <button className="btn-primary">
                                <span>Buy Course for ₹{course.price}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Default View for other courses or Video Lectures tab */
                    <div className="section-content-card">
                        <h3 className="section-card-title">
                            {activeTab === 'course-material' ? <FileText size={20} color="#34d399" /> : <Video size={20} color="#34d399" />}
                            <span>{selectedSection?.title} List</span>
                        </h3>

                        <div className="item-list">
                            {selectedSection?.items?.map((item, idx) => (
                                <div key={idx} className="content-item">
                                    <div className="item-left">
                                        {activeTab === 'course-material' ? (
                                            <FileText size={18} color="#94a3b8" />
                                        ) : (
                                            <Video size={18} color="#94a3b8" />
                                        )}
                                        <div className="item-info">
                                            <span className="item-name">{item.name || item.title}</span>
                                            {item.subTopics && (
                                                <ul className="item-subtopics">
                                                    {item.subTopics.map((sub, sIdx) => (
                                                        <li key={sIdx}>{sub}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-right">
                                        {item.duration && <span className="item-duration">{item.duration}</span>}
                                        <Lock size={16} color="#64748b" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="enroll-banner">
                            <p>Enroll in <strong>{course.title}</strong> to instantly unlock all course materials and video lectures.</p>
                            <button className="btn-primary">
                                <span>Buy Course for ₹{course.price}</span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}