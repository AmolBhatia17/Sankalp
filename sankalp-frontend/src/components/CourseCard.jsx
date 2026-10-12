import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Lock } from 'lucide-react';

export default function CourseCard({ course }) {
    return (
        <div className="course-card">
            <div className="course-image-container">
                <img 
                    src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"} 
                    alt={course.title} 
                    className="course-image" 
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop";
                    }}
                />
                <span className="course-badge">{course.badge}</span>
                <span className="course-price">₹{course.price}</span>
            </div>

            <div className="course-content">
                <div className="course-meta">
                    <div className="meta-item">
                        <BookOpen size={14} color="#34d399" />
                        <span>{course.modulesCount || course.sections?.length || 2} Modules</span>
                    </div>
                    <div className="meta-item">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{course.rating}</span>
                    </div>
                </div>

                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>

                <div className="course-footer">
                    <Link to={`/courses/${course.id}`} className="btn-card-action">
                        <span>View Syllabus</span>
                        <Lock size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
}