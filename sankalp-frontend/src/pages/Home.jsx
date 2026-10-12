import React, { useState } from 'react';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import { mockCourses } from '../data/mockCourses';
import { Filter } from 'lucide-react';

export default function Home() {
    const [selectedYear, setSelectedYear] = useState('all');

    const filteredCourses = selectedYear === 'all'
        ? mockCourses
        : mockCourses.filter(course => course.year === parseInt(selectedYear));

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
                            </select>
                        </div>
                    </div>

                    <div className="courses-grid">
                        {filteredCourses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>

                </div>
            </section>
        </div>
    );
}