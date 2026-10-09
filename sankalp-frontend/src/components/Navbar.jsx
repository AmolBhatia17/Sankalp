import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Star, User, LogIn, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar({ onOpenReview }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await logout();
    };

    const getDisplayName = () => {
        if (!user) return 'Guest';
        if (user.displayName) return user.displayName.split(' ')[0];
        if (user.email) return user.email.split('@')[0];
        return 'Learner';
    };

    const getInitials = () => {
        if (!user) return 'G';
        if (user.displayName) {
            const parts = user.displayName.trim().split(' ');
            return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
        }
        if (user.email) return user.email[0].toUpperCase();
        return 'U';
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-container">

                    {/* Brand Section with Guest/Logged In Tag */}
                    <div className="nav-brand-section">
                        <Link to="/" className="brand-logo">
                            <div className="logo-icon">
                                <GraduationCap size={22} />
                            </div>
                            <span>Sankalp</span>
                        </Link>

                        {/* Status pill next to brand */}
                        <div 
                            className={`brand-status-pill ${user ? 'status-logged-in' : 'status-guest'}`}
                            onClick={() => !user && setIsAuthOpen(true)}
                            title={user ? `Logged in as ${user.displayName || user.email}` : 'Browsing as Guest (Click to Sign In)'}
                        >
                            <span className="status-indicator-dot" />
                            <span className="status-pill-label">{user ? 'Learner' : 'Guest'}</span>
                        </div>
                    </div>

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

                    {/* Actions Area: Review Button & User Profile / Login (Uncluttered layout) */}
                    <div className="nav-actions">
                        <button className="btn-review" onClick={onOpenReview} id="navbar-review-btn">
                            <Star size={15} fill="#34d399" />
                            <span>Leave a Review</span>
                        </button>

                        <div className="nav-actions-divider" />

                        {user ? (
                            /* Logged-In User Profile Menu */
                            <div className="user-menu-wrapper" ref={dropdownRef}>
                                <button
                                    className="user-profile-pill"
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                    id="navbar-profile-btn"
                                    aria-label="User Profile Menu"
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User Avatar" className="user-avatar-img" />
                                    ) : (
                                        <div className="user-avatar-initials">{getInitials()}</div>
                                    )}
                                    <span className="user-profile-name">{getDisplayName()}</span>
                                    <ChevronDown size={14} className={`user-chevron-icon ${isDropdownOpen ? 'rotated' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="user-dropdown-popover">
                                        <div className="dropdown-user-header">
                                            <div className="dropdown-user-avatar">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt="User" />
                                                ) : (
                                                    <div className="dropdown-avatar-fallback">{getInitials()}</div>
                                                )}
                                            </div>
                                            <div className="dropdown-user-details">
                                                <div className="dropdown-user-name">{user.displayName || 'Learner'}</div>
                                                <div className="dropdown-user-email">{user.email}</div>
                                            </div>
                                        </div>

                                        <div className="dropdown-status-row">
                                            <ShieldCheck size={14} color="#34d399" />
                                            <span>Active Student Session</span>
                                        </div>

                                        <div className="dropdown-divider" />

                                        <button className="dropdown-logout-item" onClick={handleLogout} id="navbar-logout-btn">
                                            <LogOut size={15} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Guest Sign In Trigger */
                            <button
                                className="btn-auth-signin"
                                onClick={() => setIsAuthOpen(true)}
                                id="navbar-signin-btn"
                            >
                                <LogIn size={15} />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>

                </div>
            </nav>

            {/* Auth Modal Triggerable from Navbar */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
            />
        </>
    );
}