import { useState } from 'react';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import { useCourses } from '../hooks/useCourses';
import { Filter } from 'lucide-react';

export default function Home() {
    const [selectedYear, setSelectedYear] = useState('all');
    const { courses, loading } = useCourses();

    const filteredCourses = selectedYear === 'all'
        ? courses
        : courses.filter(course => course.year === parseInt(selectedYear));

    return (
        <div>
            <Hero />

            <section id="courses" className="courses-section">
                <div className="section-container">

                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Pick Your Subject</h2>
                            <p className="section-subtitle">Select your academic year to filter subject video modules.</p>
                        </div>

                        <div className="filter-wrapper">
                            <Filter size={18} color="#34d399" />
                            <select
                                className="year-dropdown"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                <option value="all">All Academic Years</option>
                                <option value="1">1st Year Subjects</option>
                                <option value="2">2nd Year Subjects</option>
                                <option value="3">3rd Year Subjects</option>
                                <option value="4">4th Year Subjects</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            Loading courses from database...
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            No courses available for this academic year yet.
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {filteredCourses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}

                </div>
            </section>
        </div>
    );
}