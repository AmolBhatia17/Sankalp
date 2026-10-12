import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, ShieldCheck } from 'lucide-react';

export default function Footer({ onOpenReview }) {
    const navigate = useNavigate();

    const handleHomeClick = (e) => {
        e.preventDefault();
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer">
            <div className="footer-container">

                <div className="footer-brand">
                    <Link to="/" onClick={handleHomeClick} className="brand-logo">
                        <div className="logo-icon">
                            <GraduationCap size={20} />
                        </div>
                        <span>Sankalp</span>
                    </Link>
                    <p className="footer-desc">
                        Empowering college students with structured video courses engineered for semester success.
                    </p>
                    <div className="footer-contact">
                        <Mail size={16} color="#34d399" />
                        <span>support@sankalp.edu</span>
                    </div>
                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Platform</h4>
                    <ul className="footer-list">
                        <li><a href="/" onClick={handleHomeClick}>Home</a></li>
                        <li><a href="/#courses">All Courses</a></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Support</Link></li>
                    </ul>
                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Legal & Trust</h4>
                    <ul className="footer-list">
                        <li><a href="#privacy">Privacy Policy</a></li>
                        <li><a href="#terms">Terms of Service</a></li>
                        <li><a href="#refund">Refund Policy</a></li>
                    </ul>
                </div>

                <div className="footer-action">
                    <h4 className="footer-heading">Have Feedback?</h4>
                    <p className="footer-action-text">
                        Help us improve the platform for your batchmates.
                    </p>
                    <button className="btn-review-footer" onClick={onOpenReview}>
                        Leave a Review
                    </button>
                </div>

            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Sankalp Educational Platform. All rights reserved.</p>
                <div className="footer-trust-badge">
                    <ShieldCheck size={16} color="#34d399" />
                    <span>Secure Razorpay Checkout Ready</span>
                </div>
            </div>
        </footer>
    );
}