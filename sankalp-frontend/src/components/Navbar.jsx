import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Star } from 'lucide-react';

export default function Navbar({ onOpenReview }) {
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="navbar">
            <div className="nav-container">

                {/* Brand Title */}
                <Link to="/" className="brand-logo">
                    <div className="logo-icon">
                        <GraduationCap size={22} />
                    </div>
                    <span>Sankalp</span>
                </Link>

                {/* Navigation Links */}
                <div className="nav-links">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Action Button */}
                <button className="btn-review" onClick={onOpenReview}>
                    <Star size={16} fill="#34d399" />
                    <span>Leave a Review</span>
                </button>

            </div>
        </nav>
    );
}